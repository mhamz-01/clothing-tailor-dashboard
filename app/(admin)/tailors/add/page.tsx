"use client"

import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

type FormValues = {
  tailor_ref_id: string
  name: string
  phone: string
  skills: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  tailor_ref_id: "",
  name: "",
  phone: "",
  skills: "",
}

function validate(values: FormValues) {
  const errors: FormErrors = {}

  if (!values.tailor_ref_id.trim()) {
    errors.tailor_ref_id = "Tailor ID is required."
  }

  if (!values.name.trim()) {
    errors.name = "Tailor name is required."
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required."
  }

  if (!values.skills.trim()) {
    errors.skills = "Skills are required."
  }

  return errors
}

export default function AddTailorPage() {
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validate(values)

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const tailorId = values.tailor_ref_id.trim()

      const { data: existingTailor, error: duplicateError } =
        await supabase
          .from("tailors")
          .select("id")
          .eq("tailor_ref_id", tailorId)
          .maybeSingle()

      if (duplicateError) {
        toast({
          title: "Error",
          description: duplicateError.message,
          variant: "destructive",
        })

        return
      }

      if (existingTailor) {
        setErrors((prev) => ({
          ...prev,
          tailor_ref_id: "Tailor ID already exists.",
        }))

        toast({
          title: "Duplicate Tailor ID",
          description: "Please use a unique tailor ID.",
          variant: "destructive",
        })

        return
      }

      const { error: insertError } = await supabase
        .from("tailors")
        .insert({
          tailor_ref_id: tailorId,
          name: values.name.trim(),
          phone: values.phone.trim(),
          skills: values.skills.trim(),
        })

      if (insertError) {
        toast({
          title: "Error",
          description: insertError.message,
          variant: "destructive",
        })

        return
      }

      toast({
        title: "Success",
        description: "Tailor added successfully.",
      })

      setValues(initialValues)
      setErrors({})
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="size-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Add Tailor
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Register a new tailor in the system
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border shadow-none">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-medium">
            Tailor Information
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
          >
            {/* Tailor ID + Name */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tailor_ref_id">
                  Tailor ID
                </Label>

                <Input
                  id="tailor_ref_id"
                  placeholder="T001"
                  value={values.tailor_ref_id}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      tailor_ref_id: event.target.value,
                    }))
                  }
                />

                {errors.tailor_ref_id && (
                  <p className="text-sm text-red-600">
                    {errors.tailor_ref_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Tailor Name
                </Label>

                <Input
                  id="name"
                  placeholder="Enter tailor name"
                  value={values.name}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />

                {errors.name && (
                  <p className="text-sm text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number
              </Label>

              <Input
                id="phone"
                placeholder="03XX XXXXXXX"
                value={values.phone}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    phone: event.target.value,
                  }))
                }
              />

              {errors.phone && (
                <p className="text-sm text-red-600">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills">
                Skills
              </Label>

              <Textarea
                id="skills"
                rows={4}
                placeholder="Shalwar Kameez, Suits, Alterations"
                value={values.skills}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    skills: event.target.value,
                  }))
                }
              />

              {errors.skills && (
                <p className="text-sm text-red-600">
                  {errors.skills}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Tailor"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link href="/dashboard">
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}