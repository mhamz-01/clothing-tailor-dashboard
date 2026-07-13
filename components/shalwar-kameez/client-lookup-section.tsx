"use client"

import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { AddClientModal } from "@/components/shalwar-kameez/add-client-modal"
import { CheckboxGroup } from "@/components/shalwar-kameez/checkbox-group"
import { PartDesignTable } from "@/components/shalwar-kameez/part-design-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { CheckboxItem, PartDesignRowState } from "@/types/shalwar-kameez"

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
  partDesignRows: PartDesignRowState[]
  onPartDesignChange: (index: number, field: "size1" | "size2" | "designNo", value: string) => void
  onPartDesignLabelClick: (row: PartDesignRowState) => void
  lookupCheckItems: CheckboxItem[]
  belowPartDesignCheckItems: CheckboxItem[]
}

// Client/record lookup row — the fields a tailor fills or searches by before
// touching any measurement data.
//
// Row 1 is Client No. / Book Date / Record No. Row 2's first column has
// Client Name and Phone No. side by side, with P-Bal on its own line below
// them. Everything else is pushed as one flush block to the far right: the
// Nokdar Tera / Chalk Asten / Kuf Dbl Kaj checkboxes sit immediately adjacent
// to the part-design table (Bazu/Kuf/Button Patti/Jaib), with Large Buttons /
// Shalwar Zip stacked below the table — all moved here from Style Options per
// client request. Deliberately two columns (not three) so there's no dead
// middle column creating empty space between the checkboxes and the table.
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
  partDesignRows,
  onPartDesignChange,
  onPartDesignLabelClick,
  lookupCheckItems,
  belowPartDesignCheckItems,
}: ClientLookupSectionProps) {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
      </div>

      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-[520px_1fr]">
        <div className="flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2">
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

          <div>
            <Label className="mb-1 block text-[12.5px] font-bold text-black">P-Bal</Label>
            <Input type="number" value={pBal} onChange={(e) => onPBalChange(e.target.value)} className={cn(FIELD_CLASS, "h-8")} />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <CheckboxGroup items={lookupCheckItems} columns={3} />

          <div className="flex flex-col gap-1.5">
            <PartDesignTable rows={partDesignRows} onSizeChange={onPartDesignChange} onLabelClick={onPartDesignLabelClick} />
            <CheckboxGroup items={belowPartDesignCheckItems} columns={2} />
          </div>
        </div>
      </div>

      <AddClientModal open={isAddClientOpen} onOpenChange={setIsAddClientOpen} />
    </div>
  )
}
