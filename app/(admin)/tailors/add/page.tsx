"use client"

import Link from "next/link"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TailorSelectCombobox } from "@/components/tailors/tailor-select-combobox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAddTailor } from "@/hooks/tailors/use-add-tailor"
import { useTailors } from "@/hooks/tailors/use-tailor"
import { useDeleteTailor } from "@/hooks/tailors/use-delete-tailor"
import { useActiveOrderCounts } from "@/hooks/assign-work/use-active-order-count"
import { validateTailorForm, type TailorFormErrors } from "@/lib/validation/tailor-form"
import type { InsertTailorInput } from "@/lib/queries/tailors"

const initialValues: InsertTailorInput = { name: "", phone: "", skills: "" }

export default function AddTailorPage() {
  const [values, setValues] = useState<InsertTailorInput>(initialValues)
  const [errors, setErrors] = useState<TailorFormErrors>({})

  const { mutate, isPending } = useAddTailor()

  const { data: tailors = [] } = useTailors()
  const { data: activeByTailor } = useActiveOrderCounts()
  const [tailorToDelete, setTailorToDelete] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const deleteTailor = useDeleteTailor()
  const activeOrderCount = activeByTailor?.get(tailorToDelete) ?? 0

  function set(key: keyof InsertTailorInput) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validateTailorForm(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    mutate(values, {
      onSuccess: () => {
        setValues(initialValues)
        setErrors({})
      },
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Add Tailor</h1>
          <p className="mt-1 text-sm text-muted-foreground">Register a new tailor in the system</p>
        </div>
      </div>

      <Card className="border shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-medium">Tailor Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Tailor Name <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="Ahmed Khan" value={values.name} onChange={set("name")} />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                <Input id="phone" placeholder="03XX XXXXXXX" value={values.phone} onChange={set("phone")} />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills <span className="text-xs text-slate-400">(optional)</span></Label>
              <Textarea id="skills" rows={3} placeholder="Shalwar Kameez, Suits, Alterations..." value={values.skills} onChange={set("skills")} />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Adding...</> : "Add Tailor"}
              </Button>
              <Button type="button" variant="outline" >
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      <details className="group rounded-lg border border-dashed px-4 py-3">
        <summary className="cursor-pointer text-xs font-medium text-muted-foreground select-none">
          Remove an existing tailor
        </summary>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <TailorSelectCombobox
              tailors={tailors}
              selectedTailorId={tailorToDelete}
              onSelect={(id) => { setTailorToDelete(id); setDeleteError(null) }}
              placeholder="Search tailor to delete..."
            />
          </div>

          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open)
              if (open) setDeleteError(null)
            }}
          >
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={!tailorToDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="mr-2 size-3.5" />
                Delete tailor
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this tailor?</AlertDialogTitle>
                {activeOrderCount > 0 ? (
                  <AlertDialogDescription>
                    This tailor has {activeOrderCount} active order{activeOrderCount === 1 ? "" : "s"} assigned.
                    Deliver or reassign {activeOrderCount === 1 ? "it" : "them"} before deleting.
                  </AlertDialogDescription>
                ) : (
                  <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
                )}
                {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{activeOrderCount > 0 ? "Close" : "Cancel"}</AlertDialogCancel>
                {activeOrderCount === 0 && (
                  <AlertDialogAction
                    disabled={deleteTailor.isPending}
                    onClick={() =>
                      deleteTailor.mutate(tailorToDelete, {
                        onSuccess: () => {
                          setTailorToDelete("")
                          setDeleteDialogOpen(false)
                        },
                        onError: (err) => setDeleteError(err.message),
                      })
                    }
                  >
                    {deleteTailor.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Deleting...</> : "Delete"}
                  </AlertDialogAction>
                )}
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </details>
    </div>
  )
}
