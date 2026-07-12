"use client"

import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { AddClientModal } from "@/components/shalwar-kameez/add-client-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"

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
}

// Client/record lookup row — the fields a tailor fills or searches by before
// touching any measurement data.
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
}: ClientLookupSectionProps) {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <Label className="mb-1 block text-[12.5px] font-bold text-black">Client No.</Label>
          <div className="flex gap-1.5">
            <Input value={clientNo} onChange={(e) => onClientNoChange(e.target.value)} placeholder="—" className={cn(FIELD_CLASS, "h-8")} />
            <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(true)} className="h-8 shrink-0 px-3 text-xs font-bold">
              <Plus /> Add
            </Button>
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-[12.5px] font-bold text-black">Book Date</Label>
          <Input type="date" value={bookDate} onChange={(e) => onBookDateChange(e.target.value)} className={cn(FIELD_CLASS, "h-8")} />
        </div>

        <div>
          <Label className="mb-1 block text-[12.5px] font-bold text-black">Record No.</Label>
          <div className="flex gap-1.5">
            <Input value={recordNo} onChange={(e) => onRecordNoChange(e.target.value)} className={cn(FIELD_CLASS, "h-8 bg-slate-50")} />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSearchRecord}
              aria-label="Search record"
              className="h-8 w-8 shrink-0"
            >
              <Search />
            </Button>
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-[12.5px] font-bold text-black">P-Bal</Label>
          <Input type="number" value={pBal} onChange={(e) => onPBalChange(e.target.value)} className={cn(FIELD_CLASS, "h-8")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label className="mb-1 block text-[12.5px] font-bold text-black">Client Name</Label>
          <div className="flex gap-1.5">
            <Input
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              placeholder="Enter client name"
              className={cn(FIELD_CLASS, "h-8 font-medium")}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSearchClientName}
              aria-label="Search client name"
              className="h-8 w-8 shrink-0"
            >
              <Search />
            </Button>
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-[12.5px] font-bold text-black">Phone No.</Label>
          <div className="flex gap-1.5">
            <Input
              type="tel"
              value={phoneNo}
              onChange={(e) => onPhoneNoChange(e.target.value)}
              placeholder="03XXXXXXXXX"
              className={cn(FIELD_CLASS, "h-8")}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSearchPhone}
              aria-label="Search phone"
              className="h-8 w-8 shrink-0"
            >
              <Search />
            </Button>
          </div>
        </div>
      </div>

      <AddClientModal open={isAddClientOpen} onOpenChange={setIsAddClientOpen} />
    </div>
  )
}
