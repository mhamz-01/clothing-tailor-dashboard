"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"
import { useButtonPrices } from "@/hooks/shalwar-kameez/use-button-prices"
import { usePricingSettings } from "@/hooks/shalwar-kameez/use-pricing-settings"
import { createShalwarKameezOrder, fetchLatestOrderForClient, fetchNextRecordNo, searchClients } from "@/lib/queries/garment-orders"
import { queryKeys } from "@/lib/queries/keys"
import {
  BAIN_GALA_IMAGES,
  BAIN_GALA_OPTIONS,
  BASIC_CHECKS,
  BUTTON_TYPE_OPTIONS,
  CLIENT_NO_PATTERN,
  COLLAR_IMAGES,
  COLLAR_OPTIONS,
  DAMAN_IMAGES,
  DAMAN_OPTIONS,
  FIVE_BUTTONS_CHECK,
  MEASUREMENTS,
  PART_DESIGN_IMAGES,
  PART_DESIGNS,
  PART_TYPE_DB_CODES,
  POCKET_IMAGES,
  POCKET_OPTIONS,
  SIZE_FRACTION_LABELS,
  STYLE_FLAG_IMAGES,
  STYLE_FLAGS,
  STYLE_FLAG_DB_CODES,
  VALID_COLLAR_TYPE_CODES,
} from "@/lib/constants/shalwar-kameez"
import { addDaysToDateInputValue, formatDueDate, todayDateInputValue } from "@/lib/utils/date"
import { formatSizeLabel } from "@/lib/utils/format-size"
import { buildOrderSheetHtml, printOrderSheetHtml } from "@/lib/utils/order-sheet"
import { buildReceiptHtml, printReceiptHtml } from "@/lib/utils/receipt"
import type {
  BasicCheckKey,
  OrderAmounts,
  PartDesignKey,
  RadioGroupName,
  RadioOptionDefinition,
  ShalwarKameezFormState,
  StatusKind,
  StyleFlagKey,
} from "@/types/shalwar-kameez"
import type {
  ClientRow,
  CreateShalwarKameezOrderInput,
  LatestClientOrder,
  OrderPricingSettings,
  PartDesignInput,
} from "@/types/garment-order"

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
    bainSize: "",
    collarSize: "",
    order: { quantity: "", deliveryDate: "", clothAmount: "", shillingAmt: "", othersAmt: "", advance: "" },
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

// Part-design size1/size2 are free text (fraction values like "1 1/4",
// or Jaib's dimension pairs like "4x4 1/2") -- no parseFloat, just an
// empty-string-to-null normalization, same shape as toNullableNumber/
// toNullableInt above.
function toNullableString(value: string): string | null {
  return value.trim() === "" ? null : value
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong."
}

function numberToInput(value: number | null): string {
  return value == null ? "" : String(value)
}

interface ClientNoValidation {
  status: "idle" | "checking" | "ok" | "invalid_format" | "existing"
  message: string
}

interface AsyncClientNoResult {
  normalized: string
  status: "ok" | "existing"
  message: string
}

// Session-only Prev/Next history: clients loaded into the form this
// session, in visit order, with a pointer at the currently-displayed one --
// browser back/forward semantics, not every client in the database.
interface ClientHistoryState {
  entries: string[]
  index: number
}

function computeDeliveryDate(bookDate: string, settings: OrderPricingSettings | null): string | null {
  return settings ? addDaysToDateInputValue(bookDate, settings.deliveryTurnaroundDays) : null
}

// Curated subset of form state that counts as "the tailor's own edits" --
// recordNo/statusMsg/statusKind are system/UI bookkeeping the tailor never
// typed, so they're excluded from the unsaved-changes comparison Prev/Next
// uses (see lastSnapshotRef below).
function snapshotEditableState(s: ShalwarKameezFormState): string {
  return JSON.stringify({
    clientNo: s.clientNo,
    bookDate: s.bookDate,
    clientName: s.clientName,
    phoneNo: s.phoneNo,
    pBal: s.pBal,
    measurements: s.measurements,
    extraNo1: s.extraNo1,
    extraNo2: s.extraNo2,
    note: s.note,
    basicChecks: s.basicChecks,
    styleFlags: s.styleFlags,
    partDesigns: s.partDesigns,
    radios: s.radios,
    bainSize: s.bainSize,
    collarSize: s.collarSize,
    order: s.order,
  })
}

export function useShalwarKameezForm() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [state, setState] = useState<ShalwarKameezFormState>(createInitialState)
  const [asyncClientNoResult, setAsyncClientNoResult] = useState<AsyncClientNoResult | null>(null)
  const [isCheckingClientNo, setIsCheckingClientNo] = useState(false)
  // Client No reached via search, or typed by hand and matched to an existing
  // client, is known to already exist -- no need to re-run the existence
  // check against it again (e.g. on save).
  const searchMatchedClientNoRef = useRef<string | null>(null)
  // Delivery Date auto-fills from Book Date + the settings page's turnaround
  // days until the tailor hand-edits it for this particular order (see
  // updateOrderField/updateBookDate below) -- a ref since it's only ever read
  // inside event handlers, never used to drive a reactive effect.
  const deliveryDateTouchedRef = useRef(false)
  // Snapshot taken every time the form is populated from something other
  // than the tailor's own typing (client loaded, cleared, or just saved) --
  // compared against the live state to decide whether Prev/Next needs to
  // warn before discarding in-progress edits (see hasUnsavedChanges).
  const lastSnapshotRef = useRef(snapshotEditableState(state))
  const [clientHistory, setClientHistory] = useState<ClientHistoryState>({ entries: [], index: -1 })
  const [pendingNav, setPendingNav] = useState<"prev" | "next" | null>(null)
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false)

  const buttonPricesQuery = useButtonPrices()
  const pricingSettingsQuery = usePricingSettings()
  const nextRecordNoQuery = useQuery({ queryKey: queryKeys.nextRecordNo, queryFn: fetchNextRecordNo })
  const buttonPrices = buttonPricesQuery.pricesByCode
  const pricingSettings = pricingSettingsQuery.data ?? null

  // Fills in the still-blank Record No./Delivery Date the first time their
  // settings arrive -- a render-time state adjustment (see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  // rather than a useEffect, since it's a one-off reaction to data becoming
  // available rather than an ongoing sync.
  const [initialDefaultsApplied, setInitialDefaultsApplied] = useState(false)
  if (!initialDefaultsApplied && nextRecordNoQuery.data != null && pricingSettings) {
    setInitialDefaultsApplied(true)
    const computed = computeDeliveryDate(state.bookDate, pricingSettings)
    setState((prev) => {
      const next: ShalwarKameezFormState = {
        ...prev,
        recordNo: prev.recordNo || String(nextRecordNoQuery.data),
        order: !prev.order.deliveryDate && computed ? { ...prev.order, deliveryDate: computed } : prev.order,
      }
      lastSnapshotRef.current = snapshotEditableState(next)
      return next
    })
  }

  // Others Amt folds in the selected Button Type's price (client request --
  // it used to live inside Tailoring Amt instead, see tailoringAmount below).
  // Others Amt is also a plain tailor-editable field, so the injected amount
  // has to coexist with whatever they've typed on top of it -- tracked as a
  // delta against what was last applied, same render-time-adjustment idiom
  // as the block above, rather than a useEffect. Driven off the live
  // radios.button + buttonPrices rather than the click that set them, so it
  // self-corrects the same way regardless of *how* the button got selected
  // (a click, loading a client's previous order, Prev/Next) and once
  // buttonPrices (loaded async) actually arrives.
  const [lastAppliedButton, setLastAppliedButton] = useState<{ code: string; price: number } | null>(null)
  if (buttonPricesQuery.isSuccess) {
    const currentButtonPrice = buttonPrices[state.radios.button] ?? 0
    if (!lastAppliedButton || lastAppliedButton.code !== state.radios.button || lastAppliedButton.price !== currentButtonPrice) {
      const delta = currentButtonPrice - (lastAppliedButton?.price ?? 0)
      setLastAppliedButton({ code: state.radios.button, price: currentButtonPrice })
      setState((prev) => {
        const updatedOthersAmt = toAmount(prev.order.othersAmt) + delta
        return { ...prev, order: { ...prev.order, othersAmt: updatedOthersAmt === 0 ? "" : String(updatedOthersAmt) } }
      })
    }
  }

  const createOrderMutation = useMutation({
    mutationFn: createShalwarKameezOrder,
    onSuccess: (_orderId, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientLatestOrder(input.clientNo) })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientByNo(input.clientNo) })
      queryClient.invalidateQueries({ queryKey: queryKeys.nextRecordNo })
    },
  })

  // Cached client-row/latest-order lookups -- revisiting a client already
  // seen this session (Prev/Next, or re-typing/re-searching the same one)
  // resolves straight from cache instead of hitting Supabase again.
  async function fetchClientRowCached(clientNo: string): Promise<ClientRow | null> {
    const rows = await queryClient.fetchQuery({
      queryKey: queryKeys.clientByNo(clientNo),
      queryFn: () => searchClients({ clientNo }),
      staleTime: 5 * 60 * 1000,
    })
    return rows[0] ?? null
  }

  function fetchLatestOrderCached(clientNo: string): Promise<LatestClientOrder | null> {
    return queryClient.fetchQuery({
      queryKey: queryKeys.clientLatestOrder(clientNo),
      queryFn: () => fetchLatestOrderForClient(clientNo),
      staleTime: 5 * 60 * 1000,
    })
  }

  // Appends a newly-visited client to the Prev/Next history, branching off
  // (discarding any forward entries) if the tailor had stepped back and then
  // looked up someone new -- standard browser back/forward semantics.
  function pushClientHistory(clientNo: string) {
    setClientHistory((prev) => {
      if (prev.entries[prev.index] === clientNo) return prev
      const entries = [...prev.entries.slice(0, prev.index + 1), clientNo]
      return { entries, index: entries.length - 1 }
    })
  }

  const canGoPrev = clientHistory.index > 0
  const canGoNext = clientHistory.index >= 0 && clientHistory.index < clientHistory.entries.length - 1

  // Merges an existing client's most recent order into the form -- shared by
  // a fresh Client No match, Name/Phone search, Add Client's "already on
  // file" pick, and Prev/Next stepping to a history entry.
  function applyLatestOrder(data: LatestClientOrder) {
    const flagCodes = new Set(data.styleFlagCodes)
    const partByType = new Map(data.partDesigns.map((part) => [part.partType, part]))

    setState((prev) => {
      const next: ShalwarKameezFormState = {
        ...prev,
        recordNo: String(data.recordNo),
        clientName: data.clientName,
        phoneNo: data.phoneNo,
        measurements: {
          lambai: numberToInput(data.measurements.lambai),
          chaati: numberToInput(data.measurements.chaati),
          bazu: numberToInput(data.measurements.bazu),
          teera: numberToInput(data.measurements.teera),
          collarM: numberToInput(data.measurements.collar),
          kamar: numberToInput(data.measurements.kamar),
          daman: numberToInput(data.measurements.daman),
          shalwarLambai: numberToInput(data.measurements.shalwarLambai),
          pancha: numberToInput(data.measurements.pancha),
        },
        note: data.note1 ?? "",
        basicChecks: {
          isLargeButtons: flagCodes.has(STYLE_FLAG_DB_CODES.isLargeButtons),
          shalwarZip: flagCodes.has(STYLE_FLAG_DB_CODES.shalwarZip),
        },
        styleFlags: {
          kafDboty: flagCodes.has(STYLE_FLAG_DB_CODES.kafDboty),
          btnDboty: flagCodes.has(STYLE_FLAG_DB_CODES.btnDboty),
          noLbl: flagCodes.has(STYLE_FLAG_DB_CODES.noLbl),
          kajPatti: flagCodes.has(STYLE_FLAG_DB_CODES.kajPatti),
          twoJeb: flagCodes.has(STYLE_FLAG_DB_CODES.twoJeb),
          noJeb: flagCodes.has(STYLE_FLAG_DB_CODES.noJeb),
          fiveBtn: flagCodes.has(STYLE_FLAG_DB_CODES.fiveBtn),
        },
        partDesigns: prev.partDesigns.map((row) => {
          const match = partByType.get(PART_TYPE_DB_CODES[row.key])
          return {
            ...row,
            // Stored as text now (see PartDesignInput) -- no numberToInput
            // round-trip, so fraction/dimension values like "1 1/4" or
            // "4x4 1/2" survive a save-then-refetch intact.
            size1: match?.size1 ?? "",
            size2: match?.size2 ?? "",
            designNo: match?.designNo != null ? String(match.designNo) : "",
          }
        }),
        radios: {
          pocket: data.pocketTypeCode ?? "",
          bain: data.bainGalaTypeCode ?? "",
          collar: data.collarTypeCode ?? "",
          daman: data.damanTypeCode ?? "",
          button: data.buttonTypeCode ?? "",
        },
        bainSize: data.bainSize ?? "",
        collarSize: data.collarSize ?? "",
      }
      lastSnapshotRef.current = snapshotEditableState(next)
      return next
    })
  }

  // Loads a client's identity + most recent order into the form, from cache
  // when possible -- shared by a fresh Client No match/Add-Client pick and
  // by Prev/Next stepping to an already-visited entry. `knownClient` skips
  // the row lookup (and primes the cache with it) when the caller already
  // has it in hand, e.g. picked from Add Client's match table.
  async function loadClientIntoForm(clientNo: string, knownClient?: ClientRow) {
    deliveryDateTouchedRef.current = false
    searchMatchedClientNoRef.current = clientNo
    if (knownClient) queryClient.setQueryData(queryKeys.clientByNo(clientNo), [knownClient])
    setAsyncClientNoResult({ normalized: clientNo, status: "existing", message: "Loading client…" })

    try {
      const client = knownClient ?? (await fetchClientRowCached(clientNo))
      if (!client) {
        setAsyncClientNoResult({ normalized: clientNo, status: "existing", message: "Client not found." })
        return
      }

      setState((prev) => {
        const computed = computeDeliveryDate(prev.bookDate, pricingSettings)
        const next: ShalwarKameezFormState = {
          ...prev,
          clientNo,
          clientName: client.clientName,
          phoneNo: client.phoneNo,
          order: computed ? { ...prev.order, deliveryDate: computed } : prev.order,
        }
        lastSnapshotRef.current = snapshotEditableState(next)
        return next
      })
      setAsyncClientNoResult({
        normalized: clientNo,
        status: "existing",
        message: `Existing client — ${client.clientName}. Loading previous order…`,
      })

      const latest = await fetchLatestOrderCached(clientNo)
      if (latest) {
        applyLatestOrder(latest)
        setAsyncClientNoResult({
          normalized: clientNo,
          status: "existing",
          message: `Existing client — ${client.clientName}. Loaded previous order.`,
        })
      } else {
        setAsyncClientNoResult({
          normalized: clientNo,
          status: "existing",
          message: `Existing client — ${client.clientName}. No previous order on file.`,
        })
      }
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
  }

  // Client No only gets checked against the DB on an explicit Enter press --
  // not on every keystroke. Typing a Client No is shared between two
  // different intents (looking up a returning client here vs. picking a
  // fresh ID in Add Client), so this box stays passive until the tailor
  // confirms what they typed.
  async function handleSearchClientNo() {
    const trimmed = state.clientNo.trim()
    if (!trimmed) return
    if (!CLIENT_NO_PATTERN.test(trimmed)) return
    const normalized = trimmed.toUpperCase()

    if (searchMatchedClientNoRef.current === normalized) {
      setAsyncClientNoResult({ normalized, status: "ok", message: "" })
      return
    }

    setIsCheckingClientNo(true)
    try {
      const client = await fetchClientRowCached(normalized)
      if (!client) {
        searchMatchedClientNoRef.current = normalized
        setAsyncClientNoResult({ normalized, status: "ok", message: "" })
        resetFormKeepingIdentity({ clientNo: normalized, clientName: "", phoneNo: "" })
        return
      }
      await loadClientIntoForm(normalized, client)
      pushClientHistory(normalized)
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    } finally {
      setIsCheckingClientNo(false)
    }
  }

  // Wipes everything back to blank except Book Date, then re-seeds Client
  // No/Name/Phone with whatever identity the caller already knows -- shared
  // by a brand-new Add Client pick (identity provided) and a Client No/Phone
  // lookup that came back empty (identity is just what was typed, the rest
  // blank). Record No. is refreshed from the DB rather than carried over --
  // this is always "starting fresh for a client with no order on file", so
  // whatever number was previously loaded/previewed is no longer the right
  // next number to show (same as Clear -- see clearForm below).
  function resetFormKeepingIdentity(overrides: { clientNo: string; clientName: string; phoneNo: string }) {
    deliveryDateTouchedRef.current = false
    setLastAppliedButton(null)
    setState((prev) => {
      const fresh = createInitialState()
      const computed = computeDeliveryDate(prev.bookDate, pricingSettings)
      const next: ShalwarKameezFormState = {
        ...fresh,
        bookDate: prev.bookDate,
        clientNo: overrides.clientNo,
        clientName: overrides.clientName,
        phoneNo: overrides.phoneNo,
        // Not part of "fresh" -- a caller may have just flashed a status
        // message (e.g. "No matching client found.") right before resetting
        // the identity fields, and that message should survive the reset.
        statusMsg: prev.statusMsg,
        statusKind: prev.statusKind,
        order: computed ? { ...fresh.order, deliveryDate: computed } : fresh.order,
      }
      lastSnapshotRef.current = snapshotEditableState(next)
      return next
    })
    nextRecordNoQuery.refetch().then(({ data }) => {
      if (data != null) setState((prev) => ({ ...prev, recordNo: String(data) }))
    })
  }

  // Fired when Add Client's Save hands back a freshly-entered Client No/Name/
  // Phone (see add-client-modal.tsx). A brand-new client shouldn't inherit
  // whatever measurements/checkboxes/style choices were left over from
  // whoever the form was previously filled out for, so everything except
  // Book Date and the Record No. preview resets to blank along with it. Not
  // an existence check itself: pressing Enter on the Client No box, or the
  // quiet catch-up check in handleSave, is what actually verifies it. Not
  // pushed to Prev/Next history yet either -- there's nothing in the
  // database to navigate back to until they're actually saved (see
  // handleSave).
  function handleAddClient(client: { clientNo: string; clientName: string; phoneNo: string }) {
    searchMatchedClientNoRef.current = null
    setAsyncClientNoResult(null)
    resetFormKeepingIdentity(client)
  }

  // Fired when a row is picked from Add Client's "already on file" match
  // table (see add-client-modal.tsx) -- unlike handleAddClient, this is
  // already a confirmed existing client, so their full previous order gets
  // loaded immediately instead of waiting on an Enter press.
  function handleSelectExistingClient(client: ClientRow) {
    const normalized = client.clientNo.trim().toUpperCase()
    loadClientIntoForm(normalized, client)
    pushClientHistory(normalized)
  }

  const clientNoValidation: ClientNoValidation = (() => {
    const trimmed = state.clientNo.trim()
    if (!trimmed) return { status: "idle", message: "" }
    if (!CLIENT_NO_PATTERN.test(trimmed)) {
      return { status: "invalid_format", message: "Format must be a letter-number, e.g. A-1" }
    }
    if (isCheckingClientNo) return { status: "checking", message: "Checking…" }
    const normalized = trimmed.toUpperCase()
    if (asyncClientNoResult?.normalized === normalized) {
      return { status: asyncClientNoResult.status, message: asyncClientNoResult.message }
    }
    return { status: "idle", message: "Press Enter to check" }
  })()

  function flashStatus(message: string, kind: StatusKind = "info") {
    setState((prev) => ({ ...prev, statusMsg: message, statusKind: kind }))
  }

  // Fired by the status toast on auto-dismiss or a manual close click --
  // not called anywhere in the save/search flows themselves, which only
  // ever flash a new message rather than clear one.
  function dismissStatus() {
    setState((prev) => (prev.statusKind === "idle" ? prev : { ...prev, statusMsg: "", statusKind: "idle" }))
  }

  function updateField<K extends keyof ShalwarKameezFormState>(key: K, value: ShalwarKameezFormState[K]) {
    setState((prev) => ({ ...prev, [key]: value }))
  }

  // Book Date's own setter (rather than routing through updateField) so
  // Delivery Date can be recomputed in the same update, right up until the
  // tailor hand-edits Delivery Date for this order (see updateOrderField).
  function updateBookDate(value: string) {
    setState((prev) => {
      if (deliveryDateTouchedRef.current) return { ...prev, bookDate: value }
      const computed = computeDeliveryDate(value, pricingSettings)
      return { ...prev, bookDate: value, order: computed ? { ...prev.order, deliveryDate: computed } : prev.order }
    })
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
    if (key === "deliveryDate") deliveryDateTouchedRef.current = true
    setState((prev) => ({ ...prev, order: { ...prev.order, [key]: value } }))
  }

  // `message`/`kind` let callers other than the plain Clear button reuse
  // this same wipe-and-refresh (e.g. handleClientDeleted below saying *why*
  // the form just emptied out, instead of the generic "Cleared").
  function clearForm(message = "Cleared", kind: StatusKind = "info") {
    deliveryDateTouchedRef.current = false
    setLastAppliedButton(null)
    const fresh = createInitialState()
    const computed = computeDeliveryDate(fresh.bookDate, pricingSettings)
    const next: ShalwarKameezFormState = {
      ...fresh,
      statusMsg: message,
      statusKind: kind,
      order: computed ? { ...fresh.order, deliveryDate: computed } : fresh.order,
    }
    lastSnapshotRef.current = snapshotEditableState(next)
    setState(next)
    setAsyncClientNoResult(null)
    searchMatchedClientNoRef.current = null
    nextRecordNoQuery.refetch().then(({ data }) => {
      if (data != null) setState((prev) => ({ ...prev, recordNo: String(data) }))
    })
  }

  // Fired when Add Client's delete confirmation actually removes a client
  // (see add-client-modal.tsx's confirmDelete). Always drops that client's
  // cached row/latest-order lookups -- a re-search moments later shouldn't
  // resolve from a 5-minute-stale cache that still thinks they exist (see
  // fetchClientRowCached/fetchLatestOrderCached above). Only wipes the
  // on-screen form if the client just deleted is the one currently loaded
  // into it -- deleting some other, unrelated client from the modal
  // shouldn't disturb whatever the tailor is mid-typing.
  function handleClientDeleted(clientNo: string) {
    const normalized = clientNo.trim().toUpperCase()
    queryClient.removeQueries({ queryKey: queryKeys.clientByNo(normalized) })
    queryClient.removeQueries({ queryKey: queryKeys.clientLatestOrder(normalized) })
    if (state.clientNo.trim().toUpperCase() !== normalized) return
    clearForm("Client deleted — form cleared.", "info")
  }

  async function handleSave() {
    if (!state.clientNo.trim() || !state.clientName.trim() || !state.phoneNo.trim()) {
      flashStatus("Client No, Client Name, and Phone No are required.", "error")
      return
    }

    const normalizedClientNo = state.clientNo.trim().toUpperCase()
    if (!CLIENT_NO_PATTERN.test(normalizedClientNo)) {
      flashStatus("Client No must be a letter-number, e.g. A-1.", "error")
      return
    }
    // Existing Client No is not an error -- create_shalwar_kameez_order
    // upserts the client and files a new order under them (a returning
    // customer). If the debounce hasn't resolved yet (fast submit), do a
    // quiet catch-up check here without blocking the save -- cached, so this
    // costs nothing if handleSearchClientNo already checked the same Client
    // No moments ago.
    if (searchMatchedClientNoRef.current !== normalizedClientNo) {
      const client = await fetchClientRowCached(normalizedClientNo)
      searchMatchedClientNoRef.current = normalizedClientNo
      setAsyncClientNoResult(
        client
          ? { normalized: normalizedClientNo, status: "existing", message: `Existing client — ${client.clientName}.` }
          : { normalized: normalizedClientNo, status: "ok", message: "" }
      )
    }

    const styleFlagCodes = [
      ...(Object.keys(state.basicChecks) as BasicCheckKey[])
        .filter((key) => state.basicChecks[key])
        .map((key) => STYLE_FLAG_DB_CODES[key]),
      ...(Object.keys(state.styleFlags) as StyleFlagKey[])
        .filter((key) => state.styleFlags[key])
        .map((key) => STYLE_FLAG_DB_CODES[key]),
    ]

    // "No Jeb" always saves as design_no 9 (pockets/pocket9.jpg, the client's
    // designated "no pocket" design) regardless of what's in the Jaib row's
    // Design # box -- the checkbox is deliberately kept from touching that
    // field on screen, so this override only happens here at save time.
    const partDesigns: PartDesignInput[] = state.partDesigns
      .filter((row) => row.designNo.trim() || row.size1.trim() || row.size2.trim() || (row.key === "jaib" && state.styleFlags.noJeb))
      .map((row) => ({
        partType: PART_TYPE_DB_CODES[row.key],
        size1: toNullableString(row.size1),
        size2: toNullableString(row.size2),
        designNo: row.key === "jaib" && state.styleFlags.noJeb ? 9 : toNullableInt(row.designNo),
      }))

    const input: CreateShalwarKameezOrderInput = {
      clientNo: normalizedClientNo,
      clientName: state.clientName.trim(),
      phoneNo: state.phoneNo.trim(),
      orderType: "kameez_shalwar",
      quantity,
      deliveryDate,
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
      bainSize: state.bainSize || null,
      collarSize: state.collarSize || null,
      styleFlagCodes,
      partDesigns,
    }

    flashStatus("Saving…")
    try {
      const orderId = await createOrderMutation.mutateAsync(input)
      setState((prev) => {
        const next: ShalwarKameezFormState = { ...prev, recordNo: String(orderId), statusMsg: "Saved.", statusKind: "success" }
        lastSnapshotRef.current = snapshotEditableState(next)
        return next
      })
      pushClientHistory(normalizedClientNo)
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
  }

  function applyClientSearchResult(results: ClientRow[]): ClientRow | null {
    if (results.length === 0) {
      flashStatus("No matching client found.", "error")
      return null
    }
    const client = results[0]
    const normalized = client.clientNo.toUpperCase()
    queryClient.setQueryData(queryKeys.clientByNo(normalized), [client])
    searchMatchedClientNoRef.current = normalized
    setAsyncClientNoResult({ normalized, status: "ok", message: "" })
    setState((prev) => {
      const next: ShalwarKameezFormState = {
        ...prev,
        clientNo: client.clientNo,
        clientName: client.clientName,
        phoneNo: client.phoneNo,
        statusMsg: results.length > 1 ? `${results.length} matches — showing first.` : "Client found.",
        statusKind: "success",
      }
      lastSnapshotRef.current = snapshotEditableState(next)
      return next
    })
    pushClientHistory(normalized)
    return client
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
    const trimmedPhone = state.phoneNo.trim()
    if (!trimmedPhone) {
      flashStatus("Enter a Phone No to search.", "error")
      return
    }
    flashStatus("Searching by phone no…")
    try {
      const client = applyClientSearchResult(await searchClients({ phoneNo: trimmedPhone }))
      if (!client) {
        resetFormKeepingIdentity({ clientNo: "", clientName: "", phoneNo: trimmedPhone })
        return
      }
      const latest = await fetchLatestOrderCached(client.clientNo)
      if (latest) {
        applyLatestOrder(latest)
        flashStatus("Client found — loaded previous order.", "success")
      }
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
  }

  // True once the form differs from what was last loaded/saved/cleared --
  // handlePrev/handleNext use this to decide whether to warn before
  // discarding in-progress edits.
  function hasUnsavedChanges(): boolean {
    return snapshotEditableState(state) !== lastSnapshotRef.current
  }

  function goToHistoryIndex(index: number) {
    const clientNo = clientHistory.entries[index]
    if (!clientNo) return
    setClientHistory((prev) => ({ ...prev, index }))
    loadClientIntoForm(clientNo)
  }

  // Step Prev/Next through clients searched/loaded this session, like
  // browser back/forward -- not every client in the database. Warns first
  // if the currently-displayed order has unsaved edits (see
  // confirmDiscardAndNavigate/cancelNavigation, rendered as a confirm dialog
  // by shalwar-kameez-form.tsx).
  function handlePrev() {
    if (!canGoPrev) return
    if (hasUnsavedChanges()) {
      setPendingNav("prev")
      return
    }
    goToHistoryIndex(clientHistory.index - 1)
  }

  function handleNext() {
    if (!canGoNext) return
    if (hasUnsavedChanges()) {
      setPendingNav("next")
      return
    }
    goToHistoryIndex(clientHistory.index + 1)
  }

  function confirmDiscardAndNavigate() {
    if (pendingNav === "prev") goToHistoryIndex(clientHistory.index - 1)
    if (pendingNav === "next") goToHistoryIndex(clientHistory.index + 1)
    setPendingNav(null)
  }

  function cancelNavigation() {
    setPendingNav(null)
  }

  // Opens the confirmation preview -- see receiptHtml/confirmPrintReceipt
  // below, which do the actual building and printing once confirmed.
  function handlePrintReceipt() {
    setReceiptPreviewOpen(true)
  }
  function closeReceiptPreview() {
    setReceiptPreviewOpen(false)
  }
  function confirmPrintReceipt() {
    try {
      printReceiptHtml(receiptHtml)
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
    setReceiptPreviewOpen(false)
  }
  function handleDelete() {
    flashStatus("Delete isn't connected yet.")
  }
  function handleSearchRecord() {
    flashStatus("Searching by record no isn't connected yet.")
  }
  // Builds and prints the A5 order sheet directly (no confirmation preview,
  // unlike Print Receipt) -- see orderSheetHtml below for what goes on it.
  function handlePrint() {
    try {
      printOrderSheetHtml(orderSheetHtml)
    } catch (error) {
      flashStatus(errorMessage(error), "error")
    }
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

  // Suit Qty defaults to 1 when blank/invalid, same as the quantity actually
  // saved on the order (see handleSave above) -- kept as one shared value so
  // the live Tailoring Amt preview always matches what gets saved.
  const quantity = Math.trunc(toAmount(state.order.quantity)) || 1
  // Delivery Date defaults to Book Date when left blank -- neither field is a
  // hard-required field on save anymore, but the orders.delivery_date column
  // itself is NOT NULL, so a save with no delivery date typed still needs
  // some date to go in. Book Date is always populated (defaults to today),
  // so it's the sensible fallback.
  const deliveryDate = state.order.deliveryDate.trim() || state.bookDate
  // Tailoring Amt = settings' base amount * Suit Qty -- read-only on the
  // order form (see order-summary-panel.tsx), computed fresh every render
  // rather than mirrored into state. The selected Button Type's price lives
  // in Others Amt instead (see the render-time adjustment above). Shilling
  // Amt is a plain tailor-entered field.
  const tailoringAmount = pricingSettings ? quantity * pricingSettings.baseTailoringAmount : 0
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

  const pocketOptions = mapRadioOptions(POCKET_OPTIONS, "pocket")
  const bainOptions = mapRadioOptions(BAIN_GALA_OPTIONS, "bain")
  const collarOptions = mapRadioOptions(COLLAR_OPTIONS, "collar")
  const damanOptions = mapRadioOptions(DAMAN_OPTIONS, "daman")
  const buttonOptions = mapRadioOptions(BUTTON_TYPE_OPTIONS, "button")
  const selectedButtonType = buttonOptions.find((option) => option.checked)

  // Rebuilt fresh every render from the same live values the Order Summary
  // panel shows -- not a snapshot taken at print time, so the preview dialog
  // (and the eventual print) always reflects whatever's currently on screen,
  // same as the rest of this form.
  const receiptHtml = buildReceiptHtml({
    recordNo: state.recordNo,
    clientNo: state.clientNo,
    clientName: state.clientName,
    bookDate: formatDueDate(state.bookDate),
    quantity: String(quantity),
    deliveryDate: formatDueDate(deliveryDate),
    buttonTypeLabel: selectedButtonType?.label ?? null,
    tailoringAmount: `Rs ${tailoringAmount.toFixed(2)}`,
    clothAmount: `Rs ${clothAmount.toFixed(2)}`,
    shillingAmt: `Rs ${shillingAmt.toFixed(2)}`,
    othersAmt: `Rs ${othersAmt.toFixed(2)}`,
    total: `Rs ${total.toFixed(2)}`,
    advance: `Rs ${advance.toFixed(2)}`,
    balance: `Rs ${balance.toFixed(2)}`,
  })

  // Reference design ("Paradise Tailors and Fabrics") has one fixed slot
  // per design choice rather than a free-flowing list of everything
  // selected -- see lib/utils/order-sheet.ts's top comment for the full
  // row-by-row mapping this mirrors. Each helper below builds one
  // OrderSheetDesignItem, or null when there's nothing to show for that
  // slot; buildOrderSheetHtml drops any row whose items are all null.
  // `separator` defaults to " / " -- order-sheet.ts's sizeLines() splits on
  // exactly that to stack size1/size2 as separate lines (Jaib/Kuf/Bazu).
  // Button Patti passes "-" instead so its Length/Width prints as one
  // "12-1 3/4" line rather than stacking (client request) -- sizeLines()
  // only splits on " / ", so a "-"-joined string naturally stays single-line.
  function partDesignItem(key: PartDesignKey, labelUr: string, forcedDesignNo?: string, separator = " / ", reverseSizes = false) {
    const row = state.partDesigns.find((r) => r.key === key)
    if (!row) return null
    const designNo = forcedDesignNo ?? row.designNo
    const image = PART_DESIGN_IMAGES[key].find((option) => option.value === designNo)
    const sizes = [row.size1 && formatSizeLabel(row.size1), row.size2 && formatSizeLabel(row.size2)]
    const sizeText = (reverseSizes ? sizes.reverse() : sizes).filter(Boolean).join(separator) || null
    if (!image && !sizeText) return null
    return { imageSrc: image?.src ?? null, label: labelUr, size: sizeText }
  }

  function flagItem(checked: boolean, label: string, imageSrc: string | null) {
    return checked ? { imageSrc, label, size: null } : null
  }

  const collarSelected = collarOptions.find((o) => o.checked)
  const bainSelected = bainOptions.find((o) => o.checked)
  // Bain/Gala and Collar each get their own cell on the reference form now
  // (row 1, left/right) -- a client can have both selected at once, so
  // unlike the old single shared slot, neither one displaces the other.
  // Print sheet's size text reuses the exact same Unicode vulgar-fraction
  // glyphs (½ ¼ ¾) as the on-screen size picker (see SIZE_FRACTION_LABELS)
  // -- a proper "1¼" character reads as a professionally-set fraction in
  // any font, rather than order-sheet.ts's own small-font-span fallback
  // (which only kicks in for a value with no glyph mapped, e.g. "1-1").
  const bainItem = bainSelected
    ? {
        imageSrc: BAIN_GALA_IMAGES[bainSelected.value] ?? null,
        label: bainSelected.label,
        size: state.bainSize ? (SIZE_FRACTION_LABELS[state.bainSize] ?? state.bainSize) : null,
      }
    : null
  const collarItem = collarSelected
    ? {
        imageSrc: COLLAR_IMAGES[collarSelected.value] ?? null,
        label: collarSelected.label,
        size: state.collarSize ? (SIZE_FRACTION_LABELS[state.collarSize] ?? state.collarSize) : null,
      }
    : null

  const pocketSelected = pocketOptions.find((o) => o.checked)
  // Order sheet shows Pockets as image-only -- no size/count digit, no
  // label (client request).
  const pocketsItem = pocketSelected
    ? { imageSrc: POCKET_IMAGES[pocketSelected.value] ?? null, label: pocketSelected.label, size: null }
    : null

  const damanSelected = damanOptions.find((o) => o.checked)
  const damanItem = damanSelected
    ? { imageSrc: DAMAN_IMAGES[damanSelected.value] ?? null, label: damanSelected.label, size: null }
    : null

  // "No Jeb" always renders as design 9 (pockets/pocket9.jpg, the client's
  // designated "no pocket" design) regardless of whatever's actually typed
  // in the Jaib row's Design # box -- same override handleSave already
  // applies at save time, mirrored here so the print sheet matches what
  // actually gets saved. Size1/Size2 are left untouched by this override,
  // same as at save time -- only the image changes.
  // Jaib's two size lines print in reverse order (size2 above size1) --
  // client request, same as Kuf below, opposite of Bazu's natural
  // size1-then-size2 stack.
  const jaibItem = partDesignItem("jaib", "جیب", state.styleFlags.noJeb ? "9" : undefined, " / ", true)
  const buttonPattiItem = partDesignItem("buttonPatti", "بٹن پٹی", undefined, "-")
  // Kuf's two size lines print in reverse order (size2 above size1) --
  // client request, same as Jaib above and Bazu below.
  const cuffItem = partDesignItem("kuf", "کف", undefined, " / ", true)
  // Bazu's two size lines print in reverse order (size2 above size1) --
  // client request, same as Jaib/Kuf above.
  const bazuItem = partDesignItem("bazu", "بازو", undefined, " / ", true)

  // Kaj Patti/Large Buttons have no confirmed per-item image beyond
  // STYLE_FLAG_IMAGES -- shown as a label-only slot when checked, same
  // "no image -> just the name" fallback used throughout this sheet.
  const kajPattiItem = flagItem(state.styleFlags.kajPatti, "Kaj Patti", STYLE_FLAG_IMAGES[STYLE_FLAG_DB_CODES.kajPatti] ?? null)
  const largeButtonsDesignItem = flagItem(
    state.basicChecks.isLargeButtons,
    "Large Buttons",
    STYLE_FLAG_IMAGES[STYLE_FLAG_DB_CODES.isLargeButtons] ?? null
  )
  const btnDbotyItem = flagItem(state.styleFlags.btnDboty, "Btn Dboty", STYLE_FLAG_IMAGES[STYLE_FLAG_DB_CODES.btnDboty] ?? null)
  const shalwarZipDesignItem = flagItem(
    state.basicChecks.shalwarZip,
    "Shalwar Zip",
    STYLE_FLAG_IMAGES[STYLE_FLAG_DB_CODES.shalwarZip] ?? null
  )

  const orderSheetHtml = buildOrderSheetHtml({
    recordNo: state.recordNo,
    clientNo: state.clientNo,
    clientName: state.clientName,
    bookDate: formatDueDate(state.bookDate),
    deliveryDate: formatDueDate(deliveryDate),
    quantity: String(quantity),
    measurements: measurementRows.map((row) => ({ ur: row.ur, value: row.value })),
    bain: bainItem,
    bainIsGolGala: bainSelected?.value === "gol_gala",
    collar: collarItem,
    largeButtons: largeButtonsDesignItem,
    btnDboty: btnDbotyItem,
    buttonPatti: buttonPattiItem,
    fiveBtn: state.styleFlags.fiveBtn,
    pockets: pocketsItem,
    jaib: jaibItem,
    kajPatti: kajPattiItem,
    cuff: cuffItem,
    kafDboty: state.styleFlags.kafDboty,
    shalwarZip: shalwarZipDesignItem,
    bazu: bazuItem,
    daman: damanItem,
  })

  return {
    state,
    clientNoValidation,
    updateField,
    updateBookDate,
    updateOrderField,
    updatePartDesign,
    clearForm,
    handleSave,
    dismissStatus,
    handleClientDeleted,
    handleSearchClientName,
    handleSearchPhone,
    handleSearchRecord,
    handleSearchClientNo,
    handleAddClient,
    handleSelectExistingClient,
    handlePrev,
    handleNext,
    canGoPrev,
    canGoNext,
    pendingNav,
    confirmDiscardAndNavigate,
    cancelNavigation,
    handlePrint,
    handlePrintReceipt,
    receiptPreviewOpen,
    receiptHtml,
    closeReceiptPreview,
    confirmPrintReceipt,
    handleDelete,
    handleExit,
    measurementRows,
    largeButtonsItem,
    shalwarZipItem,
    fiveButtonsItem,
    styleFlagItems,
    pocketOptions,
    bainOptions,
    collarOptions,
    damanOptions,
    buttonOptions,
    tailoringAmount,
    total,
    balance,
  }
}
