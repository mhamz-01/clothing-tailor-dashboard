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
      <AlertDialogContent className="w-full max-w-2xl gap-4 rounded-[10px] border border-[#dcdce1] bg-white p-6 shadow-xl">
        <AlertDialogHeader>
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

        <div className="max-h-96 overflow-y-auto rounded-[5px] border border-[#ececef]">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="bg-[#f5f5f7] text-left text-[#55555c]">
                <th className="px-3 py-2 font-semibold">Client No.</th>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((client) => (
                <tr
                  key={client.clientId}
                  onClick={() => handleSelect(client)}
                  className="cursor-pointer border-t border-[#ececef] hover:bg-[#f5f5f7]"
                >
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{client.clientNo}</td>
                  <td className="px-3 py-2.5">{client.clientName}</td>
                  <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{client.phoneNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
