"use client"

import { useState } from "react"
import { AddClientModal } from "@/components/shalwar-kameez/add-client-modal"
import { ClientNoInput } from "@/components/shalwar-kameez/client-no-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"

interface ClientNoValidation {
  status: "idle" | "checking" | "ok" | "invalid_format" | "duplicate"
  message: string
}

interface ClientLookupSectionProps {
  clientNo: string
  clientNoValidation: ClientNoValidation
  bookDate: string
  recordNo: string
  pBal: string
  clientName: string
  phoneNo: string
  onClientNoChange: (value: string) => void
  onBookDateChange: (value: string) => void
  onPBalChange: (value: string) => void
  onClientNameChange: (value: string) => void
  onPhoneNoChange: (value: string) => void
  onSearchRecord: () => void
  onSearchClientName: () => void
  onSearchPhone: () => void
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#333" strokeWidth="1.4">
      <circle cx="5" cy="5" r="3.3" />
      <line x1="7.6" y1="7.6" x2="10.5" y2="10.5" />
    </svg>
  )
}

const rowLabel = "text-[18px] font-bold whitespace-nowrap text-[#333338]"
const field = cn(FIELD_CLASS, "h-9 w-full text-[18px]")

// "Client strip" — the identity grid a tailor fills or searches by. Mirrors
// the Claude Design spec (Shalwar Kameez Dashboard.dc.html): a 6-track
// auto/1fr/auto/1fr/auto/1fr grid, with Client Name's and Phone No.'s input
// wrappers spanning 3 tracks so they get the room a name/phone number needs.
// The Shirt Options column (Nokdar Tera / Chalk Asten / Kuf Dbl Kaj) from the
// spec was dropped per client request.
const VALIDATION_TONE: Record<ClientNoValidation["status"], string> = {
  idle: "",
  checking: "text-[#8a8a92]",
  ok: "text-[#1a7f37]",
  invalid_format: "text-[#c0392b]",
  duplicate: "text-[#c0392b]",
}

export function ClientLookupSection({
  clientNo,
  clientNoValidation,
  bookDate,
  recordNo,
  pBal,
  clientName,
  phoneNo,
  onClientNoChange,
  onBookDateChange,
  onPBalChange,
  onClientNameChange,
  onPhoneNoChange,
  onSearchRecord,
  onSearchClientName,
  onSearchPhone,
}: ClientLookupSectionProps) {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  return (
    <div className="shrink-0 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-2.5 py-2">
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr] items-center gap-x-2.5 gap-y-1.5">
        <Label className={rowLabel}>Client No.</Label>
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-1">
            <ClientNoInput
              value={clientNo}
              onChange={onClientNoChange}
              invalid={clientNoValidation.status === "invalid_format" || clientNoValidation.status === "duplicate"}
              className="h-8"
              inputClassName="text-[16px]"
            />
            <button
              type="button"
              onClick={() => setIsAddClientOpen(true)}
              className="h-8 shrink-0 rounded-[3px] border border-black bg-white px-2.5 text-[16px] font-bold whitespace-nowrap hover:bg-black hover:text-white"
            >
              Add
            </button>
          </div>
          {clientNoValidation.message && (
            <span className={cn("text-[11px] font-semibold", VALIDATION_TONE[clientNoValidation.status])}>
              {clientNoValidation.message}
            </span>
          )}
        </div>

        <Label className={rowLabel}>Book Date</Label>
        <Input type="date" value={bookDate} onChange={(e) => onBookDateChange(e.target.value)} className={cn(field, "tabular-nums")} />

        <Label className={rowLabel}>Record No.</Label>
        <div className="flex gap-1">
          <Input
            value={recordNo}
            readOnly
            title="System-tracked — increments automatically on save"
            className={cn(field, "tabular-nums bg-[#f0f0f2] text-[#55555c]")}
          />
          <button
            type="button"
            onClick={onSearchRecord}
            aria-label="Search record"
            className="flex h-6 w-[26px] shrink-0 items-center justify-center rounded-[3px] border border-[#c7c7cf] bg-white hover:border-black"
          >
            <SearchIcon />
          </button>
        </div>

        <Label className={rowLabel}>Client Name</Label>
        <div className="col-span-3
         flex gap-1">
          <Input
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder="Enter client name"
            className={field}
          />
          <button
            type="button"
            onClick={onSearchClientName}
            aria-label="Search client name"
            className="flex h-6 w-[26px] shrink-0 items-center justify-center rounded-[3px] border border-[#c7c7cf] bg-white hover:border-black"
          >
            <SearchIcon />
          </button>
        </div>
        <Label className={rowLabel}>P-Bal</Label>
        <Input type="number" value={pBal} onChange={(e) => onPBalChange(e.target.value)} className={cn(field, "text-right tabular-nums")} />

        <Label className={rowLabel}>Phone No.</Label>
        <div className="col-span-3 flex gap-1">
          <Input
            type="tel"
            value={phoneNo}
            onChange={(e) => onPhoneNoChange(e.target.value)}
            placeholder="03XXXXXXXXX"
            className={cn(field, "tabular-nums")}
          />
          <button
            type="button"
            onClick={onSearchPhone}
            aria-label="Search phone"
            className="flex h-6 w-[26px] shrink-0 items-center justify-center rounded-[3px] border border-[#c7c7cf] bg-white hover:border-black"
          >
            <SearchIcon />
          </button>
        </div>
      </div>

      <AddClientModal open={isAddClientOpen} onOpenChange={setIsAddClientOpen} />
    </div>
  )
}
