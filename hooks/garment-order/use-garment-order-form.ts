"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useClientLookup, type ClientIdentity } from "@/hooks/garment-order/use-client-lookup"
import { useGarmentBasePrices } from "@/hooks/garment-order/use-garment-base-prices"
import { useStatusMessage } from "@/hooks/garment-order/use-status-message"
import { usePricingSettings } from "@/hooks/shalwar-kameez/use-pricing-settings"
import { CLIENT_NO_PATTERN } from "@/lib/constants/tailor-form"
import { computeBilling } from "@/lib/garments/billing"
import { createInitialValues, serializeDetails, serializePartDesigns, valuesFromRecord } from "@/lib/garments/form-values"
import {
  createGarmentOrder,
  deleteGarmentOrder,
  fetchGarmentOrder,
} from "@/lib/queries/garment-order-records"
import { fetchButtonTypePrices, fetchNextRecordNo } from "@/lib/queries/garment-orders"
import { queryKeys } from "@/lib/queries/keys"
import { addDaysToDateInputValue, dateInputValueFromTimestamp, formatDueDate, todayDateInputValue } from "@/lib/utils/date"
import { buildGarmentOrderSheetHtml, printGarmentOrderSheetHtml } from "@/lib/utils/garment-order-sheet"
import { buildReceiptHtml, printReceiptHtml } from "@/lib/utils/receipt"
import type {
  CreateGarmentOrderInput,
  GarmentDefinition,
  GarmentFormValues,
  GarmentOrderFields,
} from "@/types/garment-form"
import type { ClientRow } from "@/types/garment-order"
import type { StatusKind } from "@/types/shalwar-kameez"

interface FormState {
  clientNo: string
  clientName: string
  phoneNo: string
  bookDate: string
  // Book Date of the looked-up client's latest order of this garment ("" if
  // none) - display only, not part of the unsaved-changes snapshot.
  lastOrderDate: string
  pBal: string
  // "" shows the next Record No. preview; set once a record is saved/loaded.
  recordNo: string
  // The saved record currently on screen (what Delete removes), or null.
  loadedOrderId: number | null
  values: GarmentFormValues
  order: GarmentOrderFields
}

type IdentityField = "clientNo" | "clientName" | "phoneNo" | "pBal" | "bookDate"

const NO_DEFAULTS = { defaultClothAmount: 0, defaultShillingAmount: 0, defaultOthersAmount: 0 }

function createInitialOrder(): GarmentOrderFields {
  return { quantity: "", deliveryDate: "", tailoringAmt: "", clothAmount: "", shillingAmt: "", othersAmt: "", advance: "" }
}

function createInitialState(def: GarmentDefinition): FormState {
  return {
    clientNo: "",
    clientName: "",
    phoneNo: "",
    bookDate: todayDateInputValue(),
    lastOrderDate: "",
    pBal: "0",
    recordNo: "",
    loadedOrderId: null,
    values: createInitialValues(def),
    order: createInitialOrder(),
  }
}

// What counts as "the tailor's own edits" for the Prev/Next discard warning -
// the record number and loaded-record pointer are bookkeeping, not edits.
function snapshotEditableState(s: FormState): string {
  return JSON.stringify({
    clientNo: s.clientNo,
    clientName: s.clientName,
    phoneNo: s.phoneNo,
    bookDate: s.bookDate,
    pBal: s.pBal,
    values: s.values,
    order: s.order,
  })
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong."
}

function formatRupees(value: number): string {
  return `Rs ${value.toFixed(2)}`
}

// State and actions for one Waistcoat / Pant / Coat / Shirt order form. Every
// garment-specific fact comes from `def`; the same hook runs all four.
export function useGarmentOrderForm(def: GarmentDefinition) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const status = useStatusMessage()
  const [state, setState] = useState<FormState>(() => createInitialState(def))
  // Snapshot of the form as last loaded/saved/cleared, to detect unsaved edits.
  const lastSnapshotRef = useRef(snapshotEditableState(state))
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const pricingSettingsQuery = usePricingSettings()
  const basePricesQuery = useGarmentBasePrices()
  const buttonPricesQuery = useQuery({
    queryKey: queryKeys.buttonPrices,
    queryFn: fetchButtonTypePrices,
    enabled: Boolean(def.buttonType),
  })
  const nextRecordNoQuery = useQuery({ queryKey: queryKeys.nextRecordNo, queryFn: fetchNextRecordNo })

  // ---- Derived values (never mirrored into state) ---------------------------
  const pricing = pricingSettingsQuery.data
  const recordNo = state.recordNo || (nextRecordNoQuery.data != null ? String(nextRecordNoQuery.data) : "")
  // Delivery Date follows Book Date + turnaround days until the tailor edits it.
  const deliveryDate =
    state.order.deliveryDate || (pricing ? addDaysToDateInputValue(state.bookDate, pricing.deliveryTurnaroundDays) : state.bookDate)
  const buttonCode = def.buttonType ? state.values.options[def.buttonType.column] : ""
  const buttonPrice = buttonCode ? (buttonPricesQuery.data?.find((row) => row.code === buttonCode)?.price ?? 0) : 0
  const defaults = pricing ?? NO_DEFAULTS
  const baseTailoringAmount = basePricesQuery.data?.[def.key] ?? 0
  const billing = computeBilling(def, state.order, { baseTailoringAmount, defaults, buttonPrice })
  const isPricingReady =
    pricingSettingsQuery.isSuccess && basePricesQuery.isSuccess && (!def.buttonType || buttonPricesQuery.isSuccess)

  // ---- State helpers ---------------------------------------------------------
  // `baseline` marks the result as "not an unsaved edit" (loaded, saved, cleared).
  function update(updater: (prev: FormState) => FormState, options: { baseline?: boolean } = {}) {
    setState((prev) => {
      const next = updater(prev)
      if (options.baseline) lastSnapshotRef.current = snapshotEditableState(next)
      return next
    })
  }

  // Blank form that keeps only Book Date, seeded with the given identity. The
  // Record No. preview refreshes because the explicit number is cleared.
  function startFresh(identity: ClientIdentity) {
    update((prev) => ({ ...createInitialState(def), bookDate: prev.bookDate, ...identity }), { baseline: true })
    void nextRecordNoQuery.refetch()
  }

  function clearForm(message = "Cleared", kind: StatusKind = "info") {
    update(() => createInitialState(def), { baseline: true })
    lookup.reset()
    status.flash(message, kind)
    void nextRecordNoQuery.refetch()
  }

  function applyIdentity(client: ClientRow) {
    update(
      (prev) => ({ ...prev, clientNo: client.clientNo, clientName: client.clientName, phoneNo: client.phoneNo }),
      { baseline: true }
    )
    status.flash("Client found.", "success")
  }

  const lookup = useClientLookup({
    garment: def.key,
    identity: { clientNo: state.clientNo, clientName: state.clientName, phoneNo: state.phoneNo },
    applyClient: (client) =>
      update(
        (prev) => ({
          ...prev,
          clientNo: client.clientNo,
          clientName: client.clientName,
          phoneNo: client.phoneNo,
          // Refilled by applyLatestOrder if this client has an order on file.
          lastOrderDate: "",
          order: { ...prev.order, deliveryDate: "" },
        }),
        { baseline: true }
      ),
    applyLatestOrder: (order) =>
      update(
        (prev) => ({
          ...prev,
          recordNo: String(order.orderId),
          loadedOrderId: order.orderId,
          lastOrderDate: dateInputValueFromTimestamp(order.createdAt),
          values: valuesFromRecord(def, order.details, order.partDesigns),
        }),
        { baseline: true }
      ),
    applyIdentity,
    startFresh,
    onActiveClientDeleted: () => clearForm("Client deleted — form cleared."),
    hasUnsavedChanges: () => snapshotEditableState(state) !== lastSnapshotRef.current,
    flash: status.flash,
  })

  // ---- Field setters ---------------------------------------------------------
  function setField(field: IdentityField, value: string) {
    update((prev) => ({ ...prev, [field]: value }))
  }

  // Editing the Record No. box is how Search by Record No. is driven, so it
  // detaches the form from whichever saved record was loaded.
  function setRecordNo(value: string) {
    update((prev) => ({ ...prev, recordNo: value, loadedOrderId: null }))
  }

  function setMeasurement(column: string, value: string) {
    update((prev) => ({ ...prev, values: { ...prev.values, measurements: { ...prev.values.measurements, [column]: value } } }))
  }

  function setOption(column: string, value: string) {
    update((prev) => ({ ...prev, values: { ...prev.values, options: { ...prev.values.options, [column]: value } } }))
  }

  function toggleFlag(code: string) {
    update((prev) => {
      const flags = prev.values.flags.includes(code) ? prev.values.flags.filter((flag) => flag !== code) : [...prev.values.flags, code]
      return { ...prev, values: { ...prev.values, flags } }
    })
  }

  function setNote(note: string) {
    update((prev) => ({ ...prev, values: { ...prev.values, note } }))
  }

  function updatePart(index: number, field: "size1" | "size2" | "designNo", value: string) {
    update((prev) => {
      const parts = prev.values.parts.slice()
      parts[index] = { ...parts[index], [field]: value }
      return { ...prev, values: { ...prev.values, parts } }
    })
  }

  function setOrderField(key: keyof GarmentOrderFields, value: string) {
    update((prev) => ({ ...prev, order: { ...prev.order, [key]: value } }))
  }

  // ---- Save / search / delete ------------------------------------------------
  const createMutation = useMutation({
    mutationFn: (input: CreateGarmentOrderInput) => createGarmentOrder(def.key, input),
    onSuccess: (_orderId, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.garmentLatestOrder(def.key, input.clientNo) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.clientByNo(input.clientNo) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.nextRecordNo })
    },
  })

  async function handleSave() {
    const clientNo = state.clientNo.trim().toUpperCase()
    const clientName = state.clientName.trim()
    const phoneNo = state.phoneNo.trim()

    if (!clientNo || !clientName || !phoneNo) return status.flash("Client No, Client Name, and Phone No are required.", "error")
    if (!CLIENT_NO_PATTERN.test(clientNo)) return status.flash("Client No must be a letter-number, e.g. A-1.", "error")
    if (!isPricingReady) return status.flash("Pricing settings are still loading — try again in a moment.", "error")
    if (billing.advance > billing.total) return status.flash("Advance can't be more than the total.", "error")

    const input: CreateGarmentOrderInput = {
      clientNo,
      clientName,
      phoneNo,
      quantity: billing.quantity,
      deliveryDate,
      tailoringAmount: billing.tailoringAmount,
      clothAmount: billing.clothAmount,
      shillingAmt: billing.shillingAmt,
      othersAmt: billing.othersAmt,
      advanceAmt: billing.advance,
      details: serializeDetails(def, state.values),
      partDesigns: def.hasPartDesigns ? serializePartDesigns(state.values) : [],
    }

    status.flash("Saving…")
    try {
      const orderId = await createMutation.mutateAsync(input)
      update((prev) => ({ ...prev, recordNo: String(orderId), loadedOrderId: orderId }), { baseline: true })
      lookup.registerClient(clientNo, clientName)
      status.flash("Saved.", "success")
    } catch (error) {
      status.flash(errorMessage(error), "error")
    }
  }

  // Loads the saved order whose Record No. is typed in the strip, billing
  // included. The stored Others Amt already contains the button type's price,
  // which is added back by computeBilling, so it is subtracted here first.
  async function handleSearchRecord() {
    const orderId = Number.parseInt(state.recordNo, 10)
    if (!Number.isInteger(orderId) || orderId < 1) return status.flash("Enter a Record No. to search.", "error")

    status.flash("Searching…")
    try {
      const record = await fetchGarmentOrder(def.key, orderId)
      if (!record) return status.flash(`No ${def.titleEn} record ${orderId} found.`, "error")

      let recordButtonPrice = 0
      if (def.buttonType) {
        const prices = await queryClient.ensureQueryData({ queryKey: queryKeys.buttonPrices, queryFn: fetchButtonTypePrices })
        const code = String(record.details[def.buttonType.column] ?? "")
        recordButtonPrice = prices.find((row) => row.code === code)?.price ?? 0
      }

      update(
        (prev) => ({
          ...prev,
          clientNo: record.clientNo,
          clientName: record.clientName,
          phoneNo: record.phoneNo,
          bookDate: dateInputValueFromTimestamp(record.createdAt),
          // A searched record isn't necessarily the client's latest one.
          lastOrderDate: "",
          recordNo: String(record.orderId),
          loadedOrderId: record.orderId,
          values: valuesFromRecord(def, record.details, record.partDesigns),
          order: {
            quantity: String(record.quantity),
            deliveryDate: record.deliveryDate,
            tailoringAmt: String(record.tailoringAmount),
            clothAmount: String(record.clothAmount),
            shillingAmt: String(record.shillingAmt),
            othersAmt: String(Math.max(0, record.othersAmt - recordButtonPrice)),
            advance: String(record.advanceAmt),
          },
        }),
        { baseline: true }
      )
      lookup.registerClient(record.clientNo, record.clientName)
      status.flash(`Record ${record.orderId} loaded.`, "success")
    } catch (error) {
      status.flash(errorMessage(error), "error")
    }
  }

  function handleDelete() {
    if (state.loadedOrderId === null) return status.flash("Save or search for a record first.", "error")
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    const orderId = state.loadedOrderId
    setDeleteConfirmOpen(false)
    if (orderId === null) return
    try {
      await deleteGarmentOrder(def.key, orderId)
      queryClient.removeQueries({ queryKey: queryKeys.garmentLatestOrder(def.key, state.clientNo.trim().toUpperCase()) })
      clearForm(`Record ${orderId} deleted.`, "success")
    } catch (error) {
      status.flash(errorMessage(error), "error")
    }
  }

  // ---- Printing --------------------------------------------------------------
  function handlePrint() {
    try {
      printGarmentOrderSheetHtml(
        buildGarmentOrderSheetHtml({
          definition: def,
          values: state.values,
          billing,
          recordNo,
          clientNo: state.clientNo,
          clientName: state.clientName,
          phoneNo: state.phoneNo,
          bookDate: formatDueDate(state.bookDate),
          deliveryDate: formatDueDate(deliveryDate),
        })
      )
    } catch (error) {
      status.flash(errorMessage(error), "error")
    }
  }

  // Built only while the preview is open (it embeds the page origin for the logo).
  const receiptHtml = receiptPreviewOpen
    ? buildReceiptHtml({
        recordNo,
        clientNo: state.clientNo,
        clientName: state.clientName,
        bookDate: formatDueDate(state.bookDate),
        quantity: String(billing.quantity),
        deliveryDate: formatDueDate(deliveryDate),
        buttonTypeLabel: def.buttonType?.choices.find((choice) => choice.value === buttonCode)?.label ?? null,
        garmentLabel: def.titleEn,
        quantityLabel: def.quantityLabel,
        showOthersAmt: def.showOthersAmt,
        tailoringAmount: formatRupees(billing.tailoringAmount),
        clothAmount: formatRupees(billing.clothAmount),
        shillingAmt: formatRupees(billing.shillingAmt),
        othersAmt: formatRupees(billing.othersAmt),
        total: formatRupees(billing.total),
        advance: formatRupees(billing.advance),
        balance: formatRupees(billing.balance),
      })
    : ""

  function confirmPrintReceipt() {
    try {
      printReceiptHtml(receiptHtml)
    } catch (error) {
      status.flash(errorMessage(error), "error")
    }
    setReceiptPreviewOpen(false)
  }

  return {
    state,
    recordNo,
    deliveryDate,
    billing,
    // Placeholders for blank amount boxes (what applies if left empty).
    placeholders: {
      tailoringAmt: baseTailoringAmount * billing.quantity,
      clothAmount: defaults.defaultClothAmount,
      shillingAmt: defaults.defaultShillingAmount,
      othersAmt: defaults.defaultOthersAmount,
    },
    status,
    lookup,

    setField,
    setRecordNo,
    setMeasurement,
    setOption,
    toggleFlag,
    setNote,
    updatePart,
    setOrderField,

    clearForm,
    handleSave,
    handleSearchRecord,
    handlePrint,
    handleExit: () => router.push("/tailor/categories"),

    deleteConfirmOpen,
    handleDelete,
    confirmDelete,
    cancelDelete: () => setDeleteConfirmOpen(false),
    canDelete: state.loadedOrderId !== null,

    receiptPreviewOpen,
    receiptHtml,
    openReceiptPreview: () => setReceiptPreviewOpen(true),
    closeReceiptPreview: () => setReceiptPreviewOpen(false),
    confirmPrintReceipt,
  }
}
