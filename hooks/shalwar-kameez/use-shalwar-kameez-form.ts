"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value"
import {
  checkClientNoAvailability,
  createShalwarKameezOrder,
  fetchNextRecordNo,
  searchClients,
} from "@/lib/queries/garment-orders"
import {
  BAIN_GALA_OPTIONS,
  BASIC_CHECKS,
  BUTTON_TYPE_OPTIONS,
  CLIENT_NO_PATTERN,
  COLLAR_OPTIONS,
  DAMAN_OPTIONS,
  FIVE_BUTTONS_CHECK,
  MEASUREMENTS,
  PART_DESIGNS,
  PART_TYPE_DB_CODES,
  POCKET_OPTIONS,
  STYLE_FLAGS,
  STYLE_FLAG_DB_CODES,
  VALID_COLLAR_TYPE_CODES,
} from "@/lib/constants/shalwar-kameez"
import { todayDateInputValue } from "@/lib/utils/date"
import type {
  BasicCheckKey,
  OrderAmounts,
  RadioGroupName,
  RadioOptionDefinition,
  ShalwarKameezFormState,
  StatusKind,
  StyleFlagKey,
} from "@/types/shalwar-kameez"
import type { ClientRow, CreateShalwarKameezOrderInput, PartDesignInput } from "@/types/garment-order"

function createInitialState(): ShalwarKameezFormState {
  return {
    clientNo: "",
    bookDate: todayDateInputValue(),
    recordNo: "",
    clientName: "",
    phoneNo: "",
    pBal: "0",
    measurements: { lambai: "", chaati: "", bazu: "", teera: "", collarM: "", kamar: "", daman: "", shalwarLambai: "", pancha: "" },
    extraNo1: "",
    extraNo2: "",
    note: "",
    basicChecks: { isLargeButtons: false, shalwarZip: false },
    styleFlags: { kafDboty: false, btnDboty: false, noLbl: false, kajPatti: false, twoJeb: false, noJeb: false, fiveBtn: false },
    partDesigns: PART_DESIGNS.map((definition) => ({ ...definition, size1: "", size2: "", designNo: "" })),
    radios: { pocket: "", bain: "", collar: "", daman: "", button: "" },
    bainStyleNo: "",
    collarStyleNo: "",
    order: { quantity: "", deliveryDate: "", tailoringAmount: "", clothAmount: "", shillingAmt: "", othersAmt: "", advance: "" },
    statusMsg: "",
    statusKind: "idle",
  }
}

function toAmount(value: string): number {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function toNullableNumber(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? null : parsed
}

function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong."
}

interface ClientNoValidation {
  status: "idle" | "checking" | "ok" | "invalid_format" | "duplicate"
  message: string
}

interface AsyncClientNoResult {
  normalized: string
  status: "ok" | "duplicate"
  message: string
}

export function useShalwarKameezForm() {
  const router = useRouter()
  const [state, setState] = useState<ShalwarKameezFormState>(createInitialState)
  const [asyncClientNoResult, setAsyncClientNoResult] = useState<AsyncClientNoResult | null>(null)
  // Client No reached via search (an existing client placing another order) is
  // expected to already exist in the DB -- only client_no typed by hand needs
  // the "must be new" duplicate check.
  const searchMatchedClientNoRef = useRef<string | null>(null)
  const debouncedClientNo = useDebouncedValue(state.clientNo)

  // Record No is system-tracked (record_counter.total_records + 1, see
  // tailor-schema-supabase.md §8) -- shown as a preview of what the next
  // saved order will be, not something the tailor types in.
  useEffect(() => {
    fetchNextRecordNo()
      .then((next) => setState((prev) => (prev.recordNo ? prev : { ...prev, recordNo: String(next) })))
      .catch(() => {})
  }, [])

  // Format (idle/invalid_format) is derived at render time -- only the DB
  // availability check needs an effect, and its result is only trusted when
  // it matches the currently-debounced value (asyncClientNoResult.normalized).
  useEffect(() => {
    let cancelled = false
    async function run() {
      const trimmed = debouncedClientNo.trim()
      if (!trimmed || !CLIENT_NO_PATTERN.test(trimmed)) return
      const normalized = trimmed.toUpperCase()
      if (searchMatchedClientNoRef.current === normalized) {
        if (!cancelled) setAsyncClientNoResult({ normalized, status: "ok", message: "" })
        return
      }
      const { available, clientName } = await checkClientNoAvailability(normalized)
      if (cancelled) return
      setAsyncClientNoResult(
        available
          ? { normalized, status: "ok", message: "" }
          : { normalized, status: "duplicate", message: `Already used by ${clientName}` }
      )
    }
    run()
    return () => {
      cancelled = true
    }
  }, [debouncedClientNo])

  const clientNoValidation: ClientNoValidation = (() => {
    const trimmed = state.clientNo.trim()
    if (!trimmed) return { status: "idle", message: "" }
    if (!CLIENT_NO_PATTERN.test(trimmed)) {
      return { status: "invalid_format", message: "Format must be a letter-number, e.g. A-1" }
    }
    const normalized = trimmed.toUpperCase()
    if (asyncClientNoResult?.normalized === normalized) {
      return { status: asyncClientNoResult.status, message: asyncClientNoResult.message }
    }
    return { status: "checking", message: "Checking…" }
  })()

  function flashStatus(message: string, kind: StatusKind = "info") {
    setState((prev) => ({ ...prev, statusMsg: message, statusKind: kind }))
  }

  function updateField<K extends keyof ShalwarKameezFormState>(key: K, value: ShalwarKameezFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  function updateMeasurement(key: keyof ShalwarKameezFormState["measurements"], value: string) {
    setState((prev) => ({ ...prev, measurements: { ...prev.measurements, [key]: value } }))
  }

  function toggleBasicCheck(key: BasicCheckKey) {
    setState((prev) => ({ ...prev, basicChecks: { ...prev.basicChecks, [key]: !prev.basicChecks[key] } }))
  }

  function toggleStyleFlag(key: StyleFlagKey) {
    setState((prev) => ({ ...prev, styleFlags: { ...prev.styleFlags, [key]: !prev.styleFlags[key] } }))
  }

  function setRadio(group: RadioGroupName, value: string) {
    setState((prev) => ({ ...prev, radios: { ...prev.radios, [group]: value } }))
  }

  function updatePartDesign(index: number, field: "size1" | "size2" | "designNo", value: string) {
    setState((prev) => {
      const partDesigns = prev.partDesigns.slice()
      partDesigns[index] = { ...partDesigns[index], [field]: value }
      return { ...prev, partDesigns }
    })
  }

  function updateOrderField(key: keyof OrderAmounts, value: string) {
    setState((prev) => ({ ...prev, order: { ...prev.order, [key]: value } }))
  }

  function clearForm() {
    setState({ ...createInitialState(), statusMsg: "Cleared", statusKind: "info" })
    setAsyncClientNoResult(null)
    searchMatchedClientNoRef.current = null
    fetchNextRecordNo()
      .then((next) => setState((prev) => ({ ...prev, recordNo: String(next) })))
      .catch(() => {})
  }

  async function handleSave() {
    if (!state.clientNo.trim() || !state.clientName.trim() || !state.phoneNo.trim()) {
      flashStatus("Client No, Client Name, and Phone No are required.", "error")
      return
    }
    if (!state.order.quantity.trim() || !state.order.deliveryDate.trim()) {
      flashStatus("Quantity and Delivery Date are required.", "error")
      return
    }

    const normalizedClientNo = state.clientNo.trim().toUpperCase()
    if (!CLIENT_NO_PATTERN.test(normalizedClientNo)) {
      flashStatus("Client No must be a letter-number, e.g. A-1.", "error")
      return
    }
    if (searchMatchedClientNoRef.current !== normalizedClientNo) {
      flashStatus("Checking Client No…")
      const { available, clientName } = await checkClientNoAvailability(normalizedClientNo)
      if (!available) {
        setAsyncClientNoResult({
          normalized: normalizedClientNo,
          status: "duplicate",
          message: `Already used by ${clientName}`,
        })
        flashStatus(`Client No ${normalizedClientNo} is already used by ${clientName}.`, "error")
        return
      }
    }

    const styleFlagCodes = [
      ...(Object.keys(state.basicChecks) as BasicCheckKey[])
        .filter((key) => state.basicChecks[key])
        .map((key) => STYLE_FLAG_DB_CODES[key]),
      ...(Object.keys(state.styleFlags) as StyleFlagKey[])
        .filter((key) => state.styleFlags[key])
        .map((key) => STYLE_FLAG_DB_CODES[key]),
    ]

    const partDesigns: PartDesignInput[] = state.partDesigns
      .filter((row) => row.designNo.trim() || row.size1.trim() || row.size2.trim())
      .map((row) => ({
        partType: PART_TYPE_DB_CODES[row.key],
        size1: toNullableNumber(row.size1),
        size2: toNullableNumber(row.size2),
        designNo: toNullableInt(row.designNo),
      }))

    const input: CreateShalwarKameezOrderInput = {
      clientNo: normalizedClientNo,
      clientName: state.clientName.trim(),
      phoneNo: state.phoneNo.trim(),
      orderType: "kameez_shalwar",
      quantity: Math.trunc(toAmount(state.order.quantity)) || 1,
      deliveryDate: state.order.deliveryDate,
      tailoringAmount,
      clothAmount,
      shillingAmt,
      othersAmt,
      advanceAmt: advance,
      measurements: {
        lambai: toNullableNumber(state.measurements.lambai),
        chaati: toNullableNumber(state.measurements.chaati),
        bazu: toNullableNumber(state.measurements.bazu),
        teera: toNullableNumber(state.measurements.teera),
        collar: toNullableNumber(state.measurements.collarM),
        kamar: toNullableNumber(state.measurements.kamar),
        daman: toNullableNumber(state.measurements.daman),
        shalwarLambai: toNullableNumber(state.measurements.shalwarLambai),
        pancha: toNullableNumber(state.measurements.pancha),
      },
      note1: state.note.trim() || null,
      note2: null,
      pocketTypeCode: state.radios.pocket || null,
      bainGalaTypeCode: state.radios.bain || null,
      collarTypeCode: VALID_COLLAR_TYPE_CODES.includes(state.radios.collar) ? state.radios.collar : null,
      damanTypeCode: state.radios.daman || null,
      buttonTypeCode: state.radios.button || null,
      styleFlagCodes,
      partDesigns,
    }

    flashStatus("Saving…")
    try {
      const orderId = await createShalwarKameezOrder(input)
      setState((prev) => ({ ...prev, recordNo: String(orderId), statusMsg: "Saved.", statusKind: "success" }))
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
  }

  function applyClientSearchResult(results: ClientRow[]) {
    if (results.length === 0) {
      flashStatus("No matching client found.", "error")
      return
    }
    const client = results[0]
    searchMatchedClientNoRef.current = client.clientNo.toUpperCase()
    setAsyncClientNoResult({ normalized: client.clientNo.toUpperCase(), status: "ok", message: "" })
    setState((prev) => ({
      ...prev,
      clientNo: client.clientNo,
      clientName: client.clientName,
      phoneNo: client.phoneNo,
      statusMsg: results.length > 1 ? `${results.length} matches — showing first.` : "Client found.",
      statusKind: "success",
    }))
  }

  async function handleSearchClientName() {
    if (!state.clientName.trim()) {
      flashStatus("Enter a Client Name to search.", "error")
      return
    }
    flashStatus("Searching by client name…")
    try {
      applyClientSearchResult(await searchClients({ clientName: state.clientName.trim() }))
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
  }

  async function handleSearchPhone() {
    if (!state.phoneNo.trim()) {
      flashStatus("Enter a Phone No to search.", "error")
      return
    }
    flashStatus("Searching by phone no…")
    try {
      applyClientSearchResult(await searchClients({ phoneNo: state.phoneNo.trim() }))
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
  }

  // Record No. only exists once an order has been saved (it's the returned
  // garment_orders.order_id) and fetching a full existing order back into the
  // form isn't built yet, so these stay stubs for now.
  function handlePrev() {
    flashStatus("Prev isn't connected yet.")
  }
  function handleNext() {
    flashStatus("Next isn't connected yet.")
  }
  function handlePrintReceipt() {
    flashStatus("Print receipt isn't connected yet.")
  }
  function handleDelete() {
    flashStatus("Delete isn't connected yet.")
  }
  function handleSearchRecord() {
    flashStatus("Searching by record no isn't connected yet.")
  }
  function handlePrint() {
    window.print()
  }
  function handleExit() {
    router.push("/tailor/categories")
  }

  function mapRadioOptions(options: RadioOptionDefinition[], group: RadioGroupName) {
    return options.map((option) => ({
      value: option.value,
      label: option.label,
      checked: state.radios[group] === option.value,
      onChange: () => setRadio(group, option.value),
    }))
  }

  const tailoringAmount = toAmount(state.order.tailoringAmount)
  const clothAmount = toAmount(state.order.clothAmount)
  const shillingAmt = toAmount(state.order.shillingAmt)
  const othersAmt = toAmount(state.order.othersAmt)
  const advance = toAmount(state.order.advance)
  const total = tailoringAmount + clothAmount + shillingAmt + othersAmt
  const balance = total - advance

  const measurementRows = MEASUREMENTS.map((measurement) => ({
    key: measurement.key,
    ur: measurement.ur,
    value: state.measurements[measurement.key],
    onChange: (value: string) => updateMeasurement(measurement.key, value),
  }))

  // Large Buttons sits in the client-strip identity grid; Shalwar Zip sits as a
  // trailing checkbox on the Daman radio row — each rendered on its own.
  const allBasicCheckItems = BASIC_CHECKS.map((check) => ({
    key: check.key,
    label: check.label,
    checked: state.basicChecks[check.key],
    onChange: () => toggleBasicCheck(check.key),
  }))

  const largeButtonsItem = allBasicCheckItems.find((item) => item.key === "isLargeButtons")!
  const shalwarZipItem = allBasicCheckItems.find((item) => item.key === "shalwarZip")!

  const styleFlagItems = STYLE_FLAGS.map((flag) => ({
    key: flag.key,
    label: flag.label,
    checked: state.styleFlags[flag.key],
    onChange: () => toggleStyleFlag(flag.key),
  }))

  // Rendered inside the Button Patti design picker modal, not the main Style
  // Options panel — kept out of STYLE_FLAGS/styleFlagItems above.
  const fiveButtonsItem = {
    key: FIVE_BUTTONS_CHECK.key,
    label: FIVE_BUTTONS_CHECK.label,
    checked: state.styleFlags.fiveBtn,
    onChange: () => toggleStyleFlag("fiveBtn"),
  }

  return {
    state,
    clientNoValidation,
    updateField,
    updateOrderField,
    updatePartDesign,
    clearForm,
    handleSave,
    handleSearchClientName,
    handleSearchPhone,
    handleSearchRecord,
    handlePrev,
    handleNext,
    handlePrint,
    handlePrintReceipt,
    handleDelete,
    handleExit,
    measurementRows,
    largeButtonsItem,
    shalwarZipItem,
    fiveButtonsItem,
    styleFlagItems,
    pocketOptions: mapRadioOptions(POCKET_OPTIONS, "pocket"),
    bainOptions: mapRadioOptions(BAIN_GALA_OPTIONS, "bain"),
    collarOptions: mapRadioOptions(COLLAR_OPTIONS, "collar"),
    damanOptions: mapRadioOptions(DAMAN_OPTIONS, "daman"),
    buttonOptions: mapRadioOptions(BUTTON_TYPE_OPTIONS, "button"),
    total,
    balance,
  }
}
