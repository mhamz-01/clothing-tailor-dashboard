"use client"

import { CircleCheck, Loader2, TriangleAlert, Trash2, UserPlus } from "lucide-react"
import { useRef, useState, type KeyboardEvent } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { ClientNoInput } from "@/components/shalwar-kameez/client-no-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addClient, deleteClient, fetchNextClientNumber, findMatchingClients, searchClients } from "@/lib/queries/garment-orders"
import { CLIENT_NO_PATTERN, FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { ClientRow, ClientSearchQuery } from "@/types/garment-order"

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  // Fired after Save has already written the new row to the clients table
  // (see handleSave/addClient) -- carries the same Client No/Name/Phone back
  // up to the main sheet (see client-lookup-section.tsx) so it can load them
  // into the form, same as picking an existing client would.
  onAdd: (client: { clientNo: string; clientName: string; phoneNo: string }) => void
  // Fired when a row in the "already on file" match table is picked instead
  // -- unlike onAdd, this loads that client's full previous order (not just
  // the three identity fields) into the main sheet.
  onSelectExisting: (client: ClientRow) => void
  // Fired once a delete is actually confirmed by the DB (see confirmDelete
  // below) -- lets the main sheet drop its own cached lookups for this
  // client and clear itself if this was the client currently loaded there.
  onClientDeleted?: (clientNo: string) => void
}

const emptyFields = { clientId: "", clientName: "", clientMobile: "" }

export function AddClientModal({ open, onOpenChange, onAdd, onSelectExisting, onClientDeleted }: AddClientModalProps) {
  const [fields, setFields] = useState(emptyFields)
  const [error, setError] = useState("")
  // Confirms a delete actually went through -- cleared the instant the
  // tailor touches a field again, same lifetime as `error`.
  const [successMsg, setSuccessMsg] = useState("")
  const [matches, setMatches] = useState<ClientRow[]>([])
  const [isSearching, setIsSearching] = useState(false)
  // Distinguishes "haven't checked yet" from "checked, nobody matches" -- the
  // latter gets its own all-clear line instead of just showing nothing.
  const [hasSearched, setHasSearched] = useState(false)
  // Checking a row's box only marks it -- the footer's Delete button is what
  // actually raises the confirmation dialog (see handleDelete/pendingDelete).
  const [selectedForDelete, setSelectedForDelete] = useState<ClientRow | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ClientRow | null>(null)
  // Guards against an older, slower lookup landing after a newer one.
  const searchRequestIdRef = useRef(0)
  // Blocks double-clicking Save while the pre-save duplicate check is in
  // flight (see handleSave).
  const [isSaving, setIsSaving] = useState(false)
  // Enter on Client ID/Name hands focus to the next box in the sequence
  // (Client ID -> Client Name -> Client Mobile) so the tailor can tab through
  // with just Enter -- the existing-client check still runs off the blur that
  // move causes, same as it would from a mouse-click handoff.
  const clientNameRef = useRef<HTMLInputElement>(null)
  const clientMobileRef = useRef<HTMLInputElement>(null)

  function updateField(key: keyof typeof emptyFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    // Clears the previous result immediately -- it was about a different,
    // now-stale value, and a fresh one only comes back once this field is
    // complete again (see handleFieldComplete).
    setMatches([])
    setHasSearched(false)
    setError("")
    setSuccessMsg("")
  }

  // Checks the DB once a field is "complete" -- blurred or confirmed with
  // Enter -- rather than on every keystroke, and only for an exact match
  // (see findMatchingClients), so a client only ever shows up here once the
  // tailor has actually finished typing something that matches them.
  async function handleFieldComplete() {
    const clientNo = fields.clientId.trim()
    const name = fields.clientName.trim()
    const phoneNo = fields.clientMobile.trim()

    const query: ClientSearchQuery = {
      clientNo: CLIENT_NO_PATTERN.test(clientNo) ? clientNo.toUpperCase() : undefined,
      clientName: name || undefined,
      phoneNo: phoneNo || undefined,
    }
    if (!query.clientNo && !query.clientName && !query.phoneNo) {
      setMatches([])
      setHasSearched(false)
      return
    }

    const requestId = ++searchRequestIdRef.current
    setIsSearching(true)
    try {
      const results = await findMatchingClients(query)
      if (searchRequestIdRef.current !== requestId) return
      setMatches(results)
      setHasSearched(true)
    } catch {
      if (searchRequestIdRef.current === requestId) {
        setMatches([])
        setHasSearched(false)
      }
    } finally {
      if (searchRequestIdRef.current === requestId) setIsSearching(false)
    }
  }

  // On Enter: hands focus to Client Mobile. The resulting blur (Client
  // Name's own onBlur, already wired to handleFieldComplete) is what runs
  // the check, so this never fires it directly and never fires it twice.
  // Two dedicated handlers rather than one ref-accepting factory -- a ref
  // read through a function called during render (as a factory invoked
  // inline in JSX would be) trips react-hooks/refs, even though the actual
  // `.current` access here only ever happens inside the event itself.
  function handleClientNameEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return
    clientMobileRef.current?.focus()
  }

  // Last field -- Enter just blurs, running the check via onBlur same as above.
  function handleClientMobileEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") e.currentTarget.blur()
  }

  function handleClear() {
    // Invalidates any still-in-flight handleFieldComplete lookup so its
    // result lands as a no-op instead of repopulating matches with the
    // client that was just cleared.
    searchRequestIdRef.current += 1
    setFields(emptyFields)
    setMatches([])
    setIsSearching(false)
    setHasSearched(false)
    setSelectedForDelete(null)
    setError("")
    setSuccessMsg("")
  }

  // Re-checks Client No and Phone No against the DB right before writing the
  // new row -- the "matches" list above can be stale (typed after the last
  // blur, or Save clicked before that lookup resolved), and with phone_no now
  // unique (see 20260715020000_add_clients_phone_no_unique.sql) a collision
  // on either field would otherwise fail the insert below with a raw DB
  // error instead of this friendlier one. Blocks the save and tells the
  // tailor to pick the existing row or delete it first, rather than ever
  // attempting to insert colliding values. Once both checks clear, addClient
  // writes the row to the clients table immediately -- Save no longer just
  // hands the three fields up for create_shalwar_kameez_order to write later,
  // so a client added here exists on file even if no order is ever saved for
  // them.
  async function handleSave() {
    const clientNo = fields.clientId.trim().toUpperCase()
    const clientName = fields.clientName.trim()
    const phoneNo = fields.clientMobile.trim()
    if (!CLIENT_NO_PATTERN.test(clientNo)) {
      setError("Client ID must be a letter-number, e.g. A-1.")
      return
    }
    if (!clientName || !phoneNo) {
      setError("Client Name and Client Mobile are required.")
      return
    }

    setError("")
    setIsSaving(true)
    try {
      const [byClientNo, byPhone] = await Promise.all([
        searchClients({ clientNo }),
        searchClients({ phoneNo }),
      ])
      const clash = byClientNo[0] ?? byPhone[0]
      if (clash) {
        setError(
          `${clash.clientNo} — ${clash.clientName} is already on file. Select existing client first, or delete them to proceed.`
        )
        return
      }
      await addClient({ clientNo, clientName, phoneNo })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save client.")
      return
    } finally {
      setIsSaving(false)
    }

    onAdd({ clientNo, clientName, phoneNo })
    handleClear()
    onOpenChange(false)
  }

  // Doubles as "clear the draft and close" (original placeholder behavior)
  // when nothing's checked, and "confirm deleting the checked client" once a
  // row's box is checked -- the checkbox itself never opens the confirmation
  // dialog directly.
  function handleDelete() {
    if (selectedForDelete) {
      setPendingDelete(selectedForDelete)
      return
    }
    searchRequestIdRef.current += 1
    setFields(emptyFields)
    setMatches([])
    setIsSearching(false)
    setHasSearched(false)
    setError("")
    setSuccessMsg("")
    onOpenChange(false)
  }

  // A row click anywhere but the checkbox means "this is who I meant" --
  // loads that client's full previous order into the main sheet and closes
  // the modal, same as typing their Client No there and pressing Enter.
  function handleSelectMatch(client: ClientRow) {
    onSelectExisting(client)
    onOpenChange(false)
  }

  // Suggests the next unused number for a letter while picking a fresh
  // Client ID here (A-1..A-3 taken -> 4). Swallows errors -- this is a
  // convenience suggestion, not a required step, so a failed lookup should
  // just leave the number box empty for the tailor to fill in by hand.
  async function suggestNextClientNumber(letter: string): Promise<number | null> {
    try {
      return await fetchNextClientNumber(letter)
    } catch {
      return null
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    const client = pendingDelete
    try {
      await deleteClient(client.clientId)
      setMatches((prev) => prev.filter((row) => row.clientId !== client.clientId))
      setSelectedForDelete(null)
      setPendingDelete(null)
      setError("")
      setSuccessMsg(`${client.clientNo} — ${client.clientName} deleted.`)
      onClientDeleted?.(client.clientNo)
    } catch (err) {
      const message = err instanceof Error ? err.message : ""
      setError(message || "Could not delete client.")
      setSuccessMsg("")
      setPendingDelete(null)
    }
  }

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="w-full max-w-4xl gap-5 rounded-[10px] border border-[#dcdce1] bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-[6px] border border-[#dcdce1] bg-[#f5f5f7]">
              <UserPlus className="size-5 text-[#333338]" strokeWidth={2} />
            </div>
            <AlertDialogTitle className="text-[17px] font-bold text-black">Add Client</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-[#8a8a92]">
              Enter the client&apos;s details below. Finish a field to check if they&apos;re already on file.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex flex-col gap-3.5 sm:w-72 sm:shrink-0">
              <div>
                <Label className="mb-1 block text-[13px] font-bold text-black">Client ID</Label>
                <ClientNoInput
                  value={fields.clientId}
                  onChange={(value) => updateField("clientId", value)}
                  onEnter={() => clientNameRef.current?.focus()}
                  onBlur={handleFieldComplete}
                  invalid={fields.clientId.trim() !== "" && !CLIENT_NO_PATTERN.test(fields.clientId.trim())}
                  className="h-11"
                  inputClassName="text-[14px]"
                  suggestNextNumber={suggestNextClientNumber}
                />
              </div>

              <div>
                <Label className="mb-1 block text-[13px] font-bold text-black">Client Name</Label>
                <Input
                  ref={clientNameRef}
                  value={fields.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  onBlur={handleFieldComplete}
                  onKeyDown={handleClientNameEnter}
                  placeholder="Enter client name"
                  className={cn(FIELD_CLASS, "h-11 text-[14px]")}
                />
              </div>

              <div>
                <Label className="mb-1 block text-[13px] font-bold text-black">Client Mobile</Label>
                <Input
                  ref={clientMobileRef}
                  type="tel"
                  value={fields.clientMobile}
                  onChange={(e) => updateField("clientMobile", e.target.value)}
                  onBlur={handleFieldComplete}
                  onKeyDown={handleClientMobileEnter}
                  placeholder="03XXXXXXXXX"
                  className={cn(FIELD_CLASS, "h-11 text-[14px]")}
                />
              </div>

              {error && <span className="text-[12.5px] font-semibold text-[#c0392b]">{error}</span>}
              {successMsg && <span className="text-[12.5px] font-semibold text-[#1a7f37]">{successMsg}</span>}
            </div>

            <div
              className={cn(
                "flex min-w-0 flex-1 flex-col gap-2 rounded-[6px] border p-3 sm:pl-4",
                matches.length > 0 ? "border-[#f0dca3] bg-[#fffaf0]" : "border-[#ececef] bg-[#fafafb] sm:border-l-0",
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[13px] font-semibold",
                  isSearching
                    ? "text-[#8a8a92]"
                    : matches.length > 0
                      ? "text-[#8a6d1f]"
                      : hasSearched
                        ? "text-[#1a7f37]"
                        : "text-[#8a8a92]",
                )}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Checking existing clients…
                  </>
                ) : matches.length > 0 ? (
                  <>
                    <TriangleAlert className="size-4" />
                    {matches.length} matching client{matches.length === 1 ? "" : "s"} already on file
                  </>
                ) : hasSearched ? (
                  <>
                    <CircleCheck className="size-4" />
                    No match on file — looks like a new client.
                  </>
                ) : (
                  "Matching clients on file"
                )}
              </div>
              <div className="max-h-80 overflow-y-auto rounded-[5px] border border-[#e8d9a8] bg-white">
                <table className="w-full text-[13.5px]">
                  <thead>
                    <tr className="bg-[#f5f5f7] text-left text-[#55555c]">
                      <th className="px-3 py-2 font-semibold">Client No.</th>
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Phone</th>
                      <th className="px-3 py-2 text-center font-semibold">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.length > 0 ? (
                      matches.map((client) => (
                        <tr
                          key={client.clientId}
                          onClick={() => handleSelectMatch(client)}
                          className="cursor-pointer border-t border-[#ececef] hover:bg-[#f5f5f7]"
                        >
                          <td className="px-3 py-2.5 font-medium whitespace-nowrap">{client.clientNo}</td>
                          <td className="px-3 py-2.5">{client.clientName}</td>
                          <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{client.phoneNo}</td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedForDelete?.clientId === client.clientId}
                              onChange={() =>
                                setSelectedForDelete((prev) => (prev?.clientId === client.clientId ? null : client))
                              }
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${client.clientNo} to delete`}
                              className="size-4 accent-[#c0392b]"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-[#8a8a92]">
                          {isSearching ? "Searching…" : "No matches yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <span className="text-[12px] text-[#8a6d1f]">
                {matches.length > 0 ? "Tap a row to load them, or tick the box to delete." : " "}
              </span>
            </div>
          </div>

          <AlertDialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant={selectedForDelete ? "destructive" : "outline"}
              onClick={handleDelete}
              className="h-10"
            >
              {selectedForDelete ? `Delete ${selectedForDelete.clientNo}` : "Delete"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClear} className="h-10">
                Clear
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving} className="h-10">
                {isSaving ? "Checking…" : "Save"}
              </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(next) => !next && setPendingDelete(null)}>
        <AlertDialogContent className="w-full max-w-sm gap-3 rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
          {pendingDelete && (
            <>
              <AlertDialogHeader>
                <div className="mb-1 flex size-8 items-center justify-center rounded-[6px] border border-[#f3c6c6] bg-[#fdecec]">
                  <Trash2 className="size-4 text-[#c0392b]" strokeWidth={2} />
                </div>
                <AlertDialogTitle className="text-[14px] font-bold text-black">Delete client?</AlertDialogTitle>
                <AlertDialogDescription className="text-[12px] text-[#8a8a92]">
                  {pendingDelete.clientNo} — {pendingDelete.clientName} and all of their orders, measurements, and style
                  choices will be permanently removed. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="h-9">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
