"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  SendHorizonal,
  ClipboardList,
} from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { fetchTailors, fetchActiveOrderCounts } from "@/lib/queries"

// ─── Types ────────────────────────────────────────────────────────────────────

type TailorRow = {
  id: string
  name: string
}

type StagedOrder = {
  tempId: string
  tailor_id: string
  tailor_name: string
  customer_ref_id: string
  quantity: number
  due_date: string
}

type FormValues = {
  tailor_id: string
  customer_ref_id: string
  quantity: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const initialValues: FormValues = {
  tailor_id: "",
  customer_ref_id: "",
  quantity: "1",
}

function todayDateInputValue() {
  const d = new Date()

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (!values.tailor_id.trim()) {
    errors.tailor_id = "Please select a tailor."
  }

  if (!values.customer_ref_id.trim()) {
    errors.customer_ref_id = "Customer ID is required."
  }

  const qty = parseInt(values.quantity, 10)

  if (!values.quantity || isNaN(qty) || qty < 1) {
    errors.quantity = "Quantity must be at least 1."
  }

  return errors
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AssignWorkPage() {
  const queryClient = useQueryClient()

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: tailors = [],
    isLoading: isLoadingTailors,
    error: tailorsError,
  } = useQuery({
    queryKey: ["tailors"],
    queryFn: fetchTailors,
  })

  const {
    data: activeByTailor = new Map(),
    error: countsError,
  } = useQuery({
    queryKey: ["activeOrderCounts"],
    queryFn: fetchActiveOrderCounts,
  })

  const loadError =
    tailorsError?.message ?? countsError?.message ?? null

  // ── State ──────────────────────────────────────────────────────────────────

  const [tailorSearch, setTailorSearch] = useState("")
  const [tailorDropdownOpen, setTailorDropdownOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})

  const [stagedOrders, setStagedOrders] = useState<StagedOrder[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalQuantity = stagedOrders.reduce(
    (sum, order) => sum + order.quantity,
    0
  )

  // ── Filtered Tailors ───────────────────────────────────────────────────────

  const filteredTailors = useMemo(() => {
    const q = tailorSearch.toLowerCase().trim()

    if (!q) return tailors

    return tailors.filter((t: TailorRow) =>
      t.name.toLowerCase().includes(q)
    )
  }, [tailors, tailorSearch])

  // ── Add To Window ──────────────────────────────────────────────────────────

  function handleAddToWindow(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validationErrors = validate(values)

    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    const tailor = tailors.find(
      (t: TailorRow) => t.id === values.tailor_id
    )

    if (!tailor) return

    const alreadyActive =
      activeByTailor.get(values.tailor_id) ?? 0

    const alreadyStaged = stagedOrders.filter(
      (o) => o.tailor_id === values.tailor_id
    ).length

    if (alreadyActive + alreadyStaged >= 50) {
      toast({
        title: "Limit reached",
        description: `${tailor.name} already has 50 active orders.`,
        variant: "destructive",
      })

      return
    }

    const currentDate = todayDateInputValue()

    const newOrder: StagedOrder = {
      tempId: crypto.randomUUID(),
      tailor_id: values.tailor_id,
      tailor_name: tailor.name,
      customer_ref_id: values.customer_ref_id.trim(),
      quantity: parseInt(values.quantity, 10),
      due_date: currentDate,
    }

    setStagedOrders((prev) => [...prev, newOrder])

    setValues((prev) => ({
      ...prev,
      customer_ref_id: "",
      quantity: "1",
    }))
    setErrors({})
  }

  // ── Remove Staged ──────────────────────────────────────────────────────────

  function removeStaged(tempId: string) {
    setStagedOrders((prev) =>
      prev.filter((o) => o.tempId !== tempId)
    )
  }

  // ── Submit Orders ──────────────────────────────────────────────────────────

  async function handleSubmitAll() {
    if (stagedOrders.length === 0) return

    setIsSubmitting(true)

    const supabase = createClient()

    try {
      const inserts = stagedOrders.map((o) => ({
        customer_ref_id: o.customer_ref_id,
        tailor_id: o.tailor_id,
        quantity: o.quantity,
        due_date: o.due_date,
        status: "assigned",
        delivered_at: null,
      }))

      const { error } = await supabase
        .from("orders")
        .insert(inserts)

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })

        return
      }

      toast({
        title: "Work assigned!",
        description: `${
          stagedOrders.length
        } order${stagedOrders.length > 1 ? "s" : ""} submitted successfully.`,
      })

      setStagedOrders([])
      setValues(initialValues)
setTailorSearch("")


      await queryClient.invalidateQueries({
        queryKey: ["tailors"],
      })

      await queryClient.invalidateQueries({
        queryKey: ["activeOrderCounts"],
      })
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Unexpected error.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mx-auto max-w-8xl space-y-4 p-4 md:p-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <h1 className="text-xl font-bold text-gray-900">
            Assign Work
          </h1>
        </div>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* LEFT */}
          <div className="rounded-xl border bg-white p-5 lg:col-span-2">

            <div className="mb-5 border-b pb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Order Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Fill information to assign work
              </p>
            </div>

            <form
              onSubmit={handleAddToWindow}
              className="space-y-5"
            >

              {/* Tailor */}
              <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
  Tailor
  {values.tailor_id && (
    <span
      onClick={() => {
        setValues((prev) => ({ ...prev, tailor_id: "" }))
        setTailorSearch("")
      }}
      className="ml-2 cursor-pointer text-xs font-normal text-indigo-500 hover:text-indigo-700"
    >
      (change)
    </span>
  )}
</Label>

                <div className="relative">
                  <Input
                    placeholder="Search tailor..."
                    disabled={isLoadingTailors || !!values.tailor_id}
                    value={
                      tailorSearch ||
                      (values.tailor_id
                        ? tailors.find(
                            (t: TailorRow) =>
                              t.id === values.tailor_id
                          )?.name ?? ""
                        : "")
                    }
                    onChange={(e) => {
                      setTailorSearch(e.target.value)
                      setFocusedIndex(-1)

                      setValues((prev) => ({
                        ...prev,
                        tailor_id: "",
                      }))

                      setErrors((prev) => ({
                        ...prev,
                        tailor_id: undefined,
                      }))
                    }}
                    onFocus={() =>
                      setTailorDropdownOpen(true)
                    }
                    onBlur={() =>
                      setTimeout(
                        () => setTailorDropdownOpen(false),
                        150
                      )
                    }
                    onKeyDown={(e) => {
                      if (!tailorDropdownOpen) return

                      if (e.key === "ArrowDown") {
                        e.preventDefault()

                        setFocusedIndex((prev) =>
                          Math.min(
                            prev + 1,
                            filteredTailors.length - 1
                          )
                        )
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault()

                        setFocusedIndex((prev) =>
                          Math.max(prev - 1, 0)
                        )
                      } else if (e.key === "Enter") {
                        e.preventDefault()

                        const tailor =
                          filteredTailors[focusedIndex]

                        if (!tailor) return

                        const n =
                          activeByTailor.get(tailor.id) ?? 0

                        if (n >= 50) return

                        setValues((prev) => ({
                          ...prev,
                          tailor_id: tailor.id,
                        }))

                        setErrors((prev) => ({
                          ...prev,
                          tailor_id: undefined,
                        }))

                        setTailorSearch("")
                        setTailorDropdownOpen(false)
                        setFocusedIndex(-1)
                      } else if (e.key === "Escape") {
                        setTailorDropdownOpen(false)
                        setFocusedIndex(-1)
                      }
                    }}
                    autoComplete="off"
                    style={values.tailor_id ? { color: '#0f172a', fontWeight: '600', opacity: 1 } : {}}
                    className={`h-10 ${values.tailor_id ? "bg-slate-100 cursor-not-allowed" : ""}`}
                  />

                  {tailorDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
                      <div className="max-h-52 overflow-y-auto">

                        {isLoadingTailors ? (
                          <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                            <Loader2 className="size-4 animate-spin" />
                            Loading...
                          </div>
                        ) : filteredTailors.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-slate-500">
                            No tailor found
                          </div>
                        ) : (
                          filteredTailors.map(
                            (
                              t: TailorRow,
                              index: number
                            ) => {
                              const n =
                                activeByTailor.get(t.id) ?? 0

                              const atCap = n >= 50

                              const isFocused =
                                focusedIndex === index

                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  disabled={atCap}
                                  onMouseDown={() => {
                                    if (atCap) return

                                    setValues((prev) => ({
                                      ...prev,
                                      tailor_id: t.id,
                                    }))

                                    setErrors((prev) => ({
                                      ...prev,
                                      tailor_id: undefined,
                                    }))

                                    setTailorSearch("")
                                    setTailorDropdownOpen(false)
                                    setFocusedIndex(-1)
                                  }}
                                  onMouseEnter={() =>
                                    setFocusedIndex(index)
                                  }
                                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50
                                  ${
                                    isFocused
                                      ? "bg-indigo-50 text-indigo-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="font-medium">
                                    {t.name}
                                  </span>

                                  <span
                                    className={`text-xs ${
                                      n >= 45
                                        ? "text-amber-500"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {n}/50
                                  </span>
                                </button>
                              )
                            }
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {errors.tailor_id && (
                  <p className="text-xs text-red-500">
                    {errors.tailor_id}
                  </p>
                )}
              </div>

              {/* Customer ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Customer ID
                </Label>

                <Input
                  value={values.customer_ref_id}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      customer_ref_id: e.target.value,
                    }))
                  }
                  placeholder="C001"
                  className="h-10"
                />

                {errors.customer_ref_id && (
                  <p className="text-xs text-red-500">
                    {errors.customer_ref_id}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Quantity
                </Label>

                <Input
                  type="number"
                  min={1}
                  value={values.quantity}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="h-10"
                />

                {errors.quantity && (
                  <p className="text-xs text-red-500">
                    {errors.quantity}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={isLoadingTailors}
                className="mt-12 h-10 w-full"
              >
                <Plus className="mr-2 size-4" />
                Add Order
              </Button>
            </form>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col overflow-hidden rounded-xl border bg-white lg:col-span-3">

            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-slate-500" />

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Order List
                  </h2>

                  <p className="text-xs text-slate-500">
                    Pending orders before submission
                  </p>
                </div>
              </div>

              {stagedOrders.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStagedOrders([])}
                  className="text-slate-500"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Content */}
            <div
              className="overflow-y-auto p-5"
              style={{ height: "420px" }}
            >
              {stagedOrders.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center text-center">
                  <ClipboardList className="mb-3 size-10 text-slate-300" />

                  <p className="text-sm font-medium text-slate-600">
                    No orders added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Fill the form and add orders to the list
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">

                    <thead className="bg-slate-50">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left font-medium text-slate-500">
                          Tailor
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-slate-500">
                          Customer
                        </th>

                        <th className="px-4 py-3 text-left font-medium text-slate-500">
                          Qty
                        </th>

                        <th className="w-12" />
                      </tr>
                    </thead>

                    <tbody>
                      {stagedOrders.map((order) => (
                        <tr
                          key={order.tempId}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {order.tailor_name}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {order.customer_ref_id}
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {order.quantity}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeStaged(order.tempId)
                              }
                              className="size-8 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t bg-slate-50 px-5 py-4">
              {stagedOrders.length > 0 ? (
                <div className="flex items-center justify-between gap-4">

<div className="flex items-center gap-6">
  <div>
    <p className="text-xs text-slate-400">
      Orders
    </p>

    <p className="text-lg font-semibold text-slate-700">
      {stagedOrders.length}
    </p>
  </div>

  <div>
    <p className="text-xs text-slate-400">
      Total Quantity
    </p>

    <p className="text-lg font-semibold text-slate-900">
      {totalQuantity}
    </p>
  </div>
</div>

                  <Button
                    onClick={handleSubmitAll}
                    disabled={isSubmitting}
                    className="h-10 min-w-[180px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SendHorizonal className="mr-2 size-4" />
                        Submit Orders
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  No orders to submit
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}