"use client"

import { useState } from "react"
import {
  AlertDialog,
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
import { CLIENT_NO_PATTERN, FIELD_CLASS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"

interface AddClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyFields = { clientId: "", clientName: "", clientMobile: "" }

// Frontend-only "Add Client" modal, opened from the Client No. row's + Add
// button. Not wired to any client record yet — Save/Clear/Delete are UI-only
// placeholders until the clients table (tailor-schema-supabase.md) is wired up.
export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const [fields, setFields] = useState(emptyFields)

  function updateField(key: keyof typeof emptyFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function handleClear() {
    setFields(emptyFields)
  }

  function handleSave() {
    onOpenChange(false)
  }

  function handleDelete() {
    setFields(emptyFields)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-sm gap-3 rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[14px] font-bold text-black">Add Client</AlertDialogTitle>
          <AlertDialogDescription className="text-[12px] text-[#8a8a92]">
            Enter the client&apos;s details below.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <Label className="mb-1 block text-[12.5px] font-bold text-black">Client ID</Label>
            <ClientNoInput
              value={fields.clientId}
              onChange={(value) => updateField("clientId", value)}
              invalid={fields.clientId.trim() !== "" && !CLIENT_NO_PATTERN.test(fields.clientId.trim())}
              className="h-9"
            />
          </div>

          <div>
            <Label className="mb-1 block text-[12.5px] font-bold text-black">Client Name</Label>
            <Input
              value={fields.clientName}
              onChange={(e) => updateField("clientName", e.target.value)}
              placeholder="Enter client name"
              className={cn(FIELD_CLASS, "h-9")}
            />
          </div>

          <div>
            <Label className="mb-1 block text-[12.5px] font-bold text-black">Client Mobile</Label>
            <Input
              type="tel"
              value={fields.clientMobile}
              onChange={(e) => updateField("clientMobile", e.target.value)}
              placeholder="03XXXXXXXXX"
              className={cn(FIELD_CLASS, "h-9")}
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <Button type="button" variant="destructive" onClick={handleDelete} className="h-9">
            Delete
          </Button>
          <Button type="button" variant="outline" onClick={handleClear} className="h-9">
            Clear
          </Button>
          <Button type="button" onClick={handleSave} className="h-9">
            Save
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
