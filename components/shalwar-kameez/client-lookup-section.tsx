"use client"

import { useState } from "react"
import { AddClientModal } from "@/components/shalwar-kameez/add-client-modal"
import { CheckboxGroup } from "@/components/shalwar-kameez/checkbox-group"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { CheckboxItem } from "@/types/shalwar-kameez"

interface ClientLookupSectionProps {
  clientNo: string
  bookDate: string
  recordNo: string
  pBal: string
  clientName: string
  phoneNo: string
  onClientNoChange: (value: string) => void
  onBookDateChange: (value: string) => void
  onRecordNoChange: (value: string) => void
  onPBalChange: (value: string) => void
  onClientNameChange: (value: string) => void
  onPhoneNoChange: (value: string) => void
  onSearchRecord: () => void
  onSearchClientName: () => void
  onSearchPhone: () => void
  largeButtonsItem: CheckboxItem
  lookupCheckItems: CheckboxItem[]
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#333" strokeWidth="1.4">
      <circle cx="5" cy="5" r="3.3" />
      <line x1="7.6" y1="7.6" x2="10.5" y2="10.5" />
    </svg>
  )
}

const rowLabel = "text-[14px] font-bold whitespace-nowrap text-[#333338]"
const field = cn(FIELD_CLASS, "h-6 w-full")

// "Client strip" — the identity grid a tailor fills or searches by, plus a
// Shirt Options column on the right. Mirrors the Claude Design spec
// (Shalwar Kameez Dashboard.dc.html) pixel-for-pixel: a 6-track
// auto/1fr/auto/1fr/auto/1fr grid, with Client Name's and Phone No.'s input
// wrappers spanning 3 tracks so they get the room a name/phone number needs.
export function ClientLookupSection({
  clientNo,
  bookDate,
  recordNo,
  pBal,
  clientName,
  phoneNo,
  onClientNoChange,
  onBookDateChange,
  onRecordNoChange,
  onPBalChange,
  onClientNameChange,
  onPhoneNoChange,
  onSearchRecord,
  onSearchClientName,
  onSearchPhone,
  largeButtonsItem,
  lookupCheckItems,
}: ClientLookupSectionProps) {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  return (
    <div className="grid shrink-0 grid-cols-[1.55fr_1fr] gap-x-[18px] gap-y-2.5 rounded-[5px] border border-[#dcdce1] bg-[#fafafb] px-2.5 py-2">
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr] items-center gap-x-2.5 gap-y-1.5">
        <Label className={rowLabel}>Client No.</Label>
        <div className="flex gap-1">
          <Input value={clientNo} onChange={(e) => onClientNoChange(e.target.value)} placeholder="—" className={field} />
          <button
            type="button"
            onClick={() => setIsAddClientOpen(true)}
            className="h-6 shrink-0 rounded-[3px] border border-black bg-white px-2.5 text-[14px] font-bold whitespace-nowrap hover:bg-black hover:text-white"
          >
            Add
          </button>
        </div>

        <Label className={rowLabel}>Book Date</Label>
        <Input type="date" value={bookDate} onChange={(e) => onBookDateChange(e.target.value)} className={cn(field, "tabular-nums")} />

        <Label className={rowLabel}>Record No.</Label>
        <div className="flex gap-1">
          <Input value={recordNo} onChange={(e) => onRecordNoChange(e.target.value)} className={cn(field, "tabular-nums")} />
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
        <div className="col-span-3 flex gap-1">
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
        <label className="flex cursor-pointer items-center gap-1.5 text-[14px] font-bold whitespace-nowrap text-[#333338]">
          <input
            type="checkbox"
            checked={largeButtonsItem.checked}
            onChange={largeButtonsItem.onChange}
            className="size-4 cursor-pointer accent-[#111116]"
          />
          Large Buttons
        </label>
      </div>

      <div className="flex flex-col justify-center gap-2 border-l border-[#e4e4e9] pl-4">
        <div className="text-[10px] font-bold tracking-[0.09em] text-[#8a8a92] uppercase">Shirt Options</div>
        <CheckboxGroup items={lookupCheckItems} />
      </div>

      <AddClientModal open={isAddClientOpen} onOpenChange={setIsAddClientOpen} />
    </div>
  )
}
