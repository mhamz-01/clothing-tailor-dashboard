"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRef, useState } from "react"
import { CLIENT_NO_PATTERN } from "@/lib/constants/tailor-form"
import { fetchLatestGarmentOrder } from "@/lib/queries/garment-order-records"
import { searchClients } from "@/lib/queries/garment-orders"
import { queryKeys } from "@/lib/queries/keys"
import type { GarmentKey, GarmentOrderRecord } from "@/types/garment-form"
import type { ClientRow } from "@/types/garment-order"
import type { StatusKind } from "@/types/shalwar-kameez"

const CACHE_MS = 5 * 60 * 1000

export interface ClientIdentity {
  clientNo: string
  clientName: string
  phoneNo: string
}

// What the lookup needs from the form that owns the data. Keeping this a small
// interface means the lookup flow (search, history, Add Client) never touches
// form fields directly, and any garment form can host it.
export interface ClientLookupHost {
  garment: GarmentKey
  identity: ClientIdentity
  // A located client's identity went into the form (delivery date re-derives).
  applyClient: (client: ClientRow) => void
  // The client's newest order of this garment prefills measurements/options.
  applyLatestOrder: (order: GarmentOrderRecord) => void
  // Identity only (name search) with no order loaded.
  applyIdentity: (client: ClientRow) => void
  // Blank form that keeps only Book Date, seeded with this identity.
  startFresh: (identity: ClientIdentity) => void
  // The client currently on screen was deleted from the Add Client modal.
  onActiveClientDeleted: () => void
  hasUnsavedChanges: () => boolean
  flash: (message: string, kind?: StatusKind) => void
}

export interface ClientNoValidation {
  status: "idle" | "checking" | "ok" | "invalid_format" | "existing"
  message: string
}

interface AsyncClientNoResult {
  normalized: string
  status: "ok" | "existing"
  message: string
}

// Browser back/forward semantics over the clients loaded this session (not
// every client in the database).
interface ClientHistory {
  entries: string[]
  index: number
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong."
}

// Client No. entry, name/phone search, the match picker, Add Client hand-offs
// and Prev/Next history for the Waistcoat/Pant/Coat/Shirt forms. Mirrors the
// Shalwar Kameez form's behaviour, but with the form state injected through
// `host` instead of living in the same 1000-line hook.
export function useClientLookup(host: ClientLookupHost) {
  const queryClient = useQueryClient()
  const [asyncResult, setAsyncResult] = useState<AsyncClientNoResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [history, setHistory] = useState<ClientHistory>({ entries: [], index: -1 })
  const [pendingNav, setPendingNav] = useState<"prev" | "next" | null>(null)
  const [matchPicker, setMatchPicker] = useState<{ kind: "name" | "phone"; matches: ClientRow[] } | null>(null)
  // Client No. already known to exist (or to be new) - skips re-checking it.
  const knownClientNoRef = useRef<string | null>(null)

  const garmentLabel = host.garment

  // Cached lookups: revisiting a client this session (Prev/Next, re-search)
  // resolves from cache instead of hitting Supabase again.
  async function fetchClientRowCached(clientNo: string): Promise<ClientRow | null> {
    const rows = await queryClient.fetchQuery({
      queryKey: queryKeys.clientByNo(clientNo),
      queryFn: () => searchClients({ clientNo }),
      staleTime: CACHE_MS,
    })
    return rows[0] ?? null
  }

  function fetchLatestCached(clientNo: string): Promise<GarmentOrderRecord | null> {
    return queryClient.fetchQuery({
      queryKey: queryKeys.garmentLatestOrder(host.garment, clientNo),
      queryFn: () => fetchLatestGarmentOrder(host.garment, clientNo),
      staleTime: CACHE_MS,
    })
  }

  function pushHistory(clientNo: string) {
    setHistory((prev) => {
      if (prev.entries[prev.index] === clientNo) return prev
      const entries = [...prev.entries.slice(0, prev.index + 1), clientNo]
      return { entries, index: entries.length - 1 }
    })
  }

  const canGoPrev = history.index > 0
  const canGoNext = history.index >= 0 && history.index < history.entries.length - 1

  async function loadClient(clientNo: string, knownClient?: ClientRow) {
    knownClientNoRef.current = clientNo
    if (knownClient) queryClient.setQueryData(queryKeys.clientByNo(clientNo), [knownClient])
    setAsyncResult({ normalized: clientNo, status: "existing", message: "Loading client…" })

    try {
      const client = knownClient ?? (await fetchClientRowCached(clientNo))
      if (!client) {
        setAsyncResult({ normalized: clientNo, status: "existing", message: "Client not found." })
        return
      }
      host.applyClient(client)
      setAsyncResult({
        normalized: clientNo,
        status: "existing",
        message: `Existing client — ${client.clientName}. Loading previous order…`,
      })

      const latest = await fetchLatestCached(clientNo)
      if (latest) host.applyLatestOrder(latest)
      setAsyncResult({
        normalized: clientNo,
        status: "existing",
        message: latest
          ? `Existing client — ${client.clientName}. Loaded previous ${garmentLabel} order.`
          : `Existing client — ${client.clientName}. No previous ${garmentLabel} order on file.`,
      })
    } catch (error) {
      host.flash(errorMessage(error), "error")
    }
  }

  // Client No. is only checked on an explicit Enter - the box is shared between
  // looking up a returning client and choosing a fresh ID in Add Client.
  async function handleSearchClientNo() {
    const trimmed = host.identity.clientNo.trim()
    if (!trimmed || !CLIENT_NO_PATTERN.test(trimmed)) return
    const normalized = trimmed.toUpperCase()

    if (knownClientNoRef.current === normalized) {
      setAsyncResult({ normalized, status: "ok", message: "" })
      return
    }

    setIsChecking(true)
    try {
      const client = await fetchClientRowCached(normalized)
      if (!client) {
        knownClientNoRef.current = normalized
        setAsyncResult({ normalized, status: "ok", message: "" })
        host.startFresh({ clientNo: normalized, clientName: "", phoneNo: "" })
        return
      }
      await loadClient(normalized, client)
      pushHistory(normalized)
    } catch (error) {
      host.flash(errorMessage(error), "error")
    } finally {
      setIsChecking(false)
    }
  }

  const clientNoValidation: ClientNoValidation = (() => {
    const trimmed = host.identity.clientNo.trim()
    if (!trimmed) return { status: "idle", message: "" }
    if (!CLIENT_NO_PATTERN.test(trimmed)) return { status: "invalid_format", message: "Format must be a letter-number, e.g. A-1" }
    if (isChecking) return { status: "checking", message: "Checking…" }
    if (asyncResult?.normalized === trimmed.toUpperCase()) return { status: asyncResult.status, message: asyncResult.message }
    return { status: "idle", message: "Press Enter to check" }
  })()

  // Add Client's Save hands back a freshly entered identity: a new client must
  // not inherit the previous client's measurements, so the form blanks.
  function handleAddClient(client: ClientIdentity) {
    knownClientNoRef.current = null
    setAsyncResult(null)
    host.startFresh(client)
  }

  function handleSelectExistingClient(client: ClientRow) {
    const normalized = client.clientNo.trim().toUpperCase()
    void loadClient(normalized, client)
    pushHistory(normalized)
  }

  // Drops that client's cached lookups; wipes the form only if they were the
  // one on screen.
  function handleClientDeleted(clientNo: string) {
    const normalized = clientNo.trim().toUpperCase()
    queryClient.removeQueries({ queryKey: queryKeys.clientByNo(normalized) })
    queryClient.removeQueries({ queryKey: queryKeys.garmentLatestOrder(host.garment, normalized) })
    if (host.identity.clientNo.trim().toUpperCase() === normalized) host.onActiveClientDeleted()
  }

  function applyResolvedClient(client: ClientRow) {
    const normalized = client.clientNo.toUpperCase()
    queryClient.setQueryData(queryKeys.clientByNo(normalized), [client])
    knownClientNoRef.current = normalized
    setAsyncResult({ normalized, status: "ok", message: "" })
    host.applyIdentity(client)
    pushHistory(normalized)
  }

  async function loadLatestForResolved(client: ClientRow) {
    const latest = await fetchLatestCached(client.clientNo)
    if (!latest) return
    host.applyLatestOrder(latest)
    host.flash(`Client found — loaded previous ${garmentLabel} order.`, "success")
  }

  async function handleSearchClientName() {
    const name = host.identity.clientName.trim()
    if (!name) {
      host.flash("Enter a Client Name to search.", "error")
      return
    }
    host.flash("Searching by client name…")
    try {
      const results = await searchClients({ clientName: name })
      if (results.length === 0) return host.flash("No matching client found.", "error")
      if (results.length > 1) {
        host.flash(`${results.length} matches — pick one.`, "info")
        setMatchPicker({ kind: "name", matches: results })
        return
      }
      applyResolvedClient(results[0])
    } catch (error) {
      host.flash(errorMessage(error), "error")
    }
  }

  async function handleSearchPhone() {
    const phone = host.identity.phoneNo.trim()
    if (!phone) {
      host.flash("Enter a Phone No to search.", "error")
      return
    }
    host.flash("Searching by phone no…")
    try {
      const results = await searchClients({ phoneNo: phone })
      if (results.length === 0) {
        host.flash("No matching client found.", "error")
        host.startFresh({ clientNo: "", clientName: "", phoneNo: phone })
        return
      }
      if (results.length > 1) {
        host.flash(`${results.length} matches — pick one.`, "info")
        setMatchPicker({ kind: "phone", matches: results })
        return
      }
      applyResolvedClient(results[0])
      await loadLatestForResolved(results[0])
    } catch (error) {
      host.flash(errorMessage(error), "error")
    }
  }

  // A phone pick also loads the client's latest order; a name pick is identity only.
  async function handleSelectClientMatch(client: ClientRow) {
    const kind = matchPicker?.kind
    setMatchPicker(null)
    applyResolvedClient(client)
    if (kind !== "phone") return
    try {
      await loadLatestForResolved(client)
    } catch (error) {
      host.flash(errorMessage(error), "error")
    }
  }

  function goToHistoryIndex(index: number) {
    const clientNo = history.entries[index]
    if (!clientNo) return
    setHistory((prev) => ({ ...prev, index }))
    void loadClient(clientNo)
  }

  function step(direction: "prev" | "next") {
    const allowed = direction === "prev" ? canGoPrev : canGoNext
    if (!allowed) return
    if (host.hasUnsavedChanges()) return setPendingNav(direction)
    goToHistoryIndex(history.index + (direction === "prev" ? -1 : 1))
  }

  function confirmDiscardAndNavigate() {
    if (pendingNav) goToHistoryIndex(history.index + (pendingNav === "prev" ? -1 : 1))
    setPendingNav(null)
  }

  // Called after a save or a Record No. search: the client is known to exist
  // and joins the Prev/Next history.
  function registerClient(clientNo: string, clientName: string) {
    const normalized = clientNo.trim().toUpperCase()
    knownClientNoRef.current = normalized
    setAsyncResult({ normalized, status: "existing", message: `Existing client — ${clientName}.` })
    pushHistory(normalized)
  }

  // Clear: forget the checked Client No. (history is kept, like browser tabs).
  function reset() {
    setAsyncResult(null)
    knownClientNoRef.current = null
  }

  return {
    clientNoValidation,
    matchPicker,
    closeMatchPicker: () => setMatchPicker(null),
    handleSearchClientNo,
    handleSearchClientName,
    handleSearchPhone,
    handleAddClient,
    handleSelectExistingClient,
    handleClientDeleted,
    handleSelectClientMatch,
    canGoPrev,
    canGoNext,
    handlePrev: () => step("prev"),
    handleNext: () => step("next"),
    pendingNav,
    confirmDiscardAndNavigate,
    cancelNavigation: () => setPendingNav(null),
    registerClient,
    reset,
  }
}
