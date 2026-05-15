"use client"

import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type FormValues = {
  name: string
  phone: string
  skills: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = { name: "", phone: "", skills: "" }

function validate(values: FormValues) {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = "Tailor name is required."
  if (!values.phone.trim()) errors.phone = "Phone number is required."
  return errors
}

async function addTailor(values: FormValues) {
  const supabase = createClient()
 const tailor_ref_id = `T${Date.now().toString().slice(-6)}`
  const { error } = await supabase.from("tailors").insert({
    tailor_ref_id,
    name: values.name.trim(),
    phone: values.phone.trim(),
    skills: values.skills.trim() || null,
  })
  if (error) throw new Error(error.message)
}

export default function AddTailorPage() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const queryClient = useQueryClient()

  function set(key: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: addTailor,
    onSuccess: () => {
      toast({ title: "Success", description: "Tailor added successfully." })
      setValues(initialValues)
      setErrors({})
      queryClient.invalidateQueries({ queryKey: ["tailors"] })
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    },
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    mutate(values)
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
    </div>
  )
}