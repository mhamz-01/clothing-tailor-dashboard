"use client"

import { Users } from "lucide-react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { ClientRow } from "@/types/garment-order"

interface ClientMatchPickerModalProps {
  open: boolean
  matches: ClientRow[]
  onOpenChange: (open: boolean) => void
  onSelect: (client: ClientRow) => void
}

// Shown when a Client Name or Phone No search (see client-lookup-section.tsx)
// matches more than one client -- phone_no is no longer unique (see
// 20260727000000_drop_clients_phone_no_unique.sql) and a name search was
// always a substring match, so either can legitimately return several
// clients now. Picking a row loads that client the same way a single,
// unambiguous match would. Table styling mirrors add-client-modal.tsx's own
// match table.
export function ClientMatchPickerModal({ open, matches, onOpenChange, onSelect }: ClientMatchPickerModalProps) {
  function handleSelect(client: ClientRow) {
    onSelect(client)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* flex-col + max-h-[85vh] bounds the whole dialog to the viewport --
          only the table body scrolls (below), so the header/footer stay put
          and the dialog itself never grows past the screen no matter how
          many clients matched. */}
      <AlertDialogContent className="flex max-h-[85vh] w-full max-w-2xl flex-col gap-4 overflow-hidden rounded-[10px] border border-[#dcdce1] bg-white p-6 shadow-xl">
        <AlertDialogHeader className="shrink-0">
          <div className="mb-1 flex size-10 items-center justify-center rounded-[6px] border border-[#dcdce1] bg-[#f5f5f7]">
            <Users className="size-5 text-[#333338]" strokeWidth={2} />
          </div>
          <AlertDialogTitle className="text-[17px] font-bold text-black">
            {matches.length} matching clients
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] text-[#8a8a92]">
            More than one client matches — pick the one to load.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-[5px] border border-[#ececef]">
          <table className="w-full border-collapse text-[13.5px]">
            {/* sticky + z-10 keeps the column headers visible while the rows
                scroll underneath them. */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f5f5f7] text-left text-[#55555c] shadow-[0_1px_0_0_#ececef]">
                <th className="px-3 py-2 font-semibold">Client No.</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((client, index) => (
                <tr
                  key={client.clientId}
                  onClick={() => handleSelect(client)}
                  className={cn(
                    "cursor-pointer border-t border-[#ececef] hover:bg-[#f5f5f7]",
                    index % 2 === 1 && "bg-[#fafafb]"
                  )}
                >
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{client.clientNo}</td>
                  <td className="px-3 py-2.5">{client.clientName}</td>
                  <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{client.phoneNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AlertDialogFooter className="shrink-0">
          <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
