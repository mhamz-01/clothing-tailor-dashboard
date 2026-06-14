"use client"

import Link from "next/link"
import {
  ArrowLeft, Loader2, Plus, Trash2, SendHorizonal,
  ClipboardList, ListChecks,
} from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { fetchTailors, fetchActiveOrderCounts, fetchAssignedOrdersWithTailors } from "@/lib/queries"

type TailorRow = { id: string; name: string }
type StagedOrder = {
  tempId: string; tailor_id: string; tailor_name: string
  customer_ref_id: string; quantity: number; due_date: string
}
type FormValues = { tailor_id: string; customer_ref_id: string; quantity: string }
type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = { tailor_id: "", customer_ref_id: "", quantity: "1" }

function todayDateInputValue() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.tailor_id.trim()) errors.tailor_id = "Please select a tailor."
  if (!values.customer_ref_id.trim()) errors.customer_ref_id = "Customer ID is required."
  const qty = parseInt(values.quantity, 10)
  if (!values.quantity || isNaN(qty) || qty < 1) errors.quantity = "Quantity must be at least 1."
  return errors
}

// ── Manage Tab Component (lazy — only mounts when tab is active) ──────────────

function ManageAssignedTab({
  tailors,
  activeByTailor,
  onChanged,
}: {
  tailors: TailorRow[]
  activeByTailor: Map<string, number>
  onChanged: () => void
}) {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTailorId, setEditTailorId] = useState("")
  const [editDropdownOpen, setEditDropdownOpen] = useState(false)
  const [editSearch, setEditSearch] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["assignedOrdersManage"],
    queryFn: fetchAssignedOrdersWithTailors,
    staleTime: 1000 * 30,
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return orders
    return orders.filter((o: any) =>
      o.customer_ref_id.toLowerCase().includes(q) ||
      (o.tailor?.name ?? "").toLowerCase().includes(q)
    )
  }, [orders, search])

  const filteredEditTailors = useMemo(() => {
    const q = editSearch.toLowerCase().trim()
    if (!q) return tailors
    return tailors.filter((t) => t.name.toLowerCase().includes(q))
  }, [tailors, editSearch])

  async function handleSaveTailor(orderId: string) {
    if (!editTailorId) return
    setSavingId(orderId)
    const { error } = await supabase
      .from("orders")
      .update({ tailor_id: editTailorId })
      .eq("id", orderId)
    setSavingId(null)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      return
    }
    toast({ title: "Tailor updated successfully." })
    setEditingId(null)
    setEditTailorId("")
    setEditSearch("")
    queryClient.invalidateQueries({ queryKey: ["assignedOrdersManage"] })
    queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
    onChanged()
  }

  async function handleRemove(orderId: string, customerRef: string) {
    if (!confirm(`Remove order for ${customerRef}? This cannot be undone.`)) return
    setRemovingId(orderId)
    const { error } = await supabase.from("orders").delete().eq("id", orderId)
    setRemovingId(null)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      return
    }
    toast({ title: "Order removed." })
    queryClient.invalidateQueries({ queryKey: ["assignedOrdersManage"] })
    queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
    onChanged()
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: "520px" }}>
      <div className="p-4 border-b">
        <Input
          placeholder="Search by customer or tailor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ListChecks className="mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No assigned orders found</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-slate-50 z-10">
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Tailor</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Qty</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Due</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any) => {
                const isEditing = editingId === order.id
                return (
                  <tr key={order.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{order.customer_ref_id}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {isEditing ? (
                        <div className="relative">
                          <Input
                            placeholder="Search tailor..."
                            value={editSearch || (editTailorId ? tailors.find(t => t.id === editTailorId)?.name ?? "" : "")}
                            onChange={(e) => { setEditSearch(e.target.value); setEditTailorId("") }}
                            onFocus={() => setEditDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setEditDropdownOpen(false), 150)}
                            className="h-8 text-xs"
                            autoComplete="off"
                          />
                          {editDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-48 overflow-hidden rounded-lg border bg-white shadow-lg">
                              <div className="max-h-40 overflow-y-auto">
                                {filteredEditTailors.map((t) => {
                                  const n = activeByTailor.get(t.id) ?? 0
                                  const atCap = n >= 50
                                  return (
                                    <button
                                      key={t.id}
                                      type="button"
                                      disabled={atCap}
                                      onMouseDown={() => {
                                        setEditTailorId(t.id)
                                        setEditSearch("")
                                        setEditDropdownOpen(false)
                                      }}
                                      className="flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-40"
                                    >
                                      <span>{t.name}</span>
                                      <span className="text-slate-400">{n}/50</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span>{order.tailor?.name ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.quantity ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {order.due_date?.split("T")[0].split("-").reverse().join("/") ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs"
                              disabled={!editTailorId || savingId === order.id}
                              onClick={() => handleSaveTailor(order.id)}
                            >
                              {savingId === order.id ? <Loader2 className="size-3 animate-spin" /> : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-3 text-xs"
                              onClick={() => { setEditingId(null); setEditTailorId(""); setEditSearch("") }}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs"
                              onClick={() => { setEditingId(order.id); setEditTailorId(order.tailor_id ?? "") }}
                            >
                              Change Tailor
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-slate-400 hover:text-red-500"
                              disabled={removingId === order.id}
                              onClick={() => handleRemove(order.id, order.customer_ref_id)}
                            >
                              {removingId === order.id
                                ? <Loader2 className="size-3 animate-spin" />
                                : <Trash2 className="size-3.5" />
                              }
                            </Button> */}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AssignWorkPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"assign" | "manage">("assign")

  const { data: tailors = [], isLoading: isLoadingTailors, error: tailorsError } = useQuery({
    queryKey: ["tailors"],
    queryFn: fetchTailors,
  })

  const { data: activeByTailor = new Map(), error: countsError } = useQuery({
    queryKey: ["activeOrderCounts"],
    queryFn: fetchActiveOrderCounts,
  })

  const loadError = tailorsError?.message ?? countsError?.message ?? null

  const [tailorSearch, setTailorSearch] = useState("")
  const [tailorDropdownOpen, setTailorDropdownOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [values, setValues] = useState<FormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [stagedOrders, setStagedOrders] = useState<StagedOrder[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalQuantity = stagedOrders.reduce((sum, o) => sum + o.quantity, 0)

  const filteredTailors = useMemo(() => {
    const q = tailorSearch.toLowerCase().trim()
    if (!q) return tailors
    return tailors.filter((t: TailorRow) => t.name.toLowerCase().includes(q))
  }, [tailors, tailorSearch])

  function handleAddToWindow(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return
    const tailor = tailors.find((t: TailorRow) => t.id === values.tailor_id)
    if (!tailor) return
    const alreadyActive = activeByTailor.get(values.tailor_id) ?? 0
    const alreadyStaged = stagedOrders.filter((o) => o.tailor_id === values.tailor_id).length
    if (alreadyActive + alreadyStaged >= 50) {
      toast({ title: "Limit reached", description: `${tailor.name} already has 50 active orders.`, variant: "destructive" })
      return
    }
    setStagedOrders((prev) => [...prev, {
      tempId: crypto.randomUUID(),
      tailor_id: values.tailor_id,
      tailor_name: tailor.name,
      customer_ref_id: values.customer_ref_id.trim(),
      quantity: parseInt(values.quantity, 10),
      due_date: todayDateInputValue(),
    }])
    setValues((prev) => ({ ...prev, customer_ref_id: "", quantity: "1" }))
    setErrors({})
  }

  function removeStaged(tempId: string) {
    setStagedOrders((prev) => prev.filter((o) => o.tempId !== tempId))
  }

  async function handleSubmitAll() {
    if (stagedOrders.length === 0) return
    setIsSubmitting(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.from("orders").insert(
        stagedOrders.map((o) => ({
          customer_ref_id: o.customer_ref_id,
          tailor_id: o.tailor_id,
          quantity: o.quantity,
          due_date: o.due_date,
          status: "assigned",
          delivered_at: null,
        }))
      )
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return }
      toast({ title: "Work assigned!", description: `${stagedOrders.length} order${stagedOrders.length > 1 ? "s" : ""} submitted.` })
      setStagedOrders([])
      setValues(initialValues)
      setTailorSearch("")
      queryClient.invalidateQueries({ queryKey: ["tailors"] })
      queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
      queryClient.invalidateQueries({ queryKey: ["assignedOrdersManage"] })
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unexpected error.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-8xl space-y-4 p-4 md:p-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-gray-900">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Assign Work</h1>
        </div>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

          {/* LEFT FORM */}
          <div className=" p-5 lg:col-span-2">
            <div className="mb-5 border-b pb-4">
              <h2 className="text-base font-semibold text-slate-900">Order Details</h2>
              <p className="mt-1 text-sm text-slate-500">Fill information to assign work</p>
            </div>

            <form onSubmit={handleAddToWindow} className="space-y-5">
              {/* Tailor */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Tailor
                  {values.tailor_id && (
                    <span onClick={() => { setValues((prev) => ({ ...prev, tailor_id: "" })); setTailorSearch("") }}
                      className="ml-2 cursor-pointer text-xs font-normal text-indigo-500 hover:text-indigo-700">
                      (change)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Search tailor..."
                    disabled={isLoadingTailors || !!values.tailor_id}
                    value={tailorSearch || (values.tailor_id ? tailors.find((t: TailorRow) => t.id === values.tailor_id)?.name ?? "" : "")}
                    onChange={(e) => { setTailorSearch(e.target.value); setFocusedIndex(-1); setValues((prev) => ({ ...prev, tailor_id: "" })); setErrors((prev) => ({ ...prev, tailor_id: undefined })) }}
                    onFocus={() => setTailorDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setTailorDropdownOpen(false), 150)}
                    onKeyDown={(e) => {
                      if (!tailorDropdownOpen) return
                      if (e.key === "ArrowDown") { e.preventDefault(); setFocusedIndex((prev) => Math.min(prev + 1, filteredTailors.length - 1)) }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setFocusedIndex((prev) => Math.max(prev - 1, 0)) }
                      else if (e.key === "Enter") {
                        e.preventDefault()
                        const tailor = filteredTailors[focusedIndex]
                        if (!tailor || (activeByTailor.get(tailor.id) ?? 0) >= 50) return
                        setValues((prev) => ({ ...prev, tailor_id: tailor.id }))
                        setErrors((prev) => ({ ...prev, tailor_id: undefined }))
                        setTailorSearch(""); setTailorDropdownOpen(false); setFocusedIndex(-1)
                      } else if (e.key === "Escape") { setTailorDropdownOpen(false); setFocusedIndex(-1) }
                    }}
                    autoComplete="off"
                    style={values.tailor_id ? { color: '#0f172a', fontWeight: '600', opacity: 1 } : {}}
                    className={`h-10 ${values.tailor_id ? "bg-slate-100 cursor-not-allowed" : ""}`}
                  />
                  {tailorDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
                      <div className="max-h-52 overflow-y-auto">
                        {isLoadingTailors ? (
                          <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" />Loading...</div>
                        ) : filteredTailors.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-slate-500">No tailor found</div>
                        ) : filteredTailors.map((t: TailorRow, index: number) => {
                          const n = activeByTailor.get(t.id) ?? 0
                          const atCap = n >= 50
                          const isFocused = focusedIndex === index
                          return (
                            <button key={t.id} type="button" disabled={atCap}
                              onMouseDown={() => { if (atCap) return; setValues((prev) => ({ ...prev, tailor_id: t.id })); setErrors((prev) => ({ ...prev, tailor_id: undefined })); setTailorSearch(""); setTailorDropdownOpen(false); setFocusedIndex(-1) }}
                              onMouseEnter={() => setFocusedIndex(index)}
                              className={`flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isFocused ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"}`}
                            >
                              <span className="font-medium">{t.name}</span>
                              <span className={`text-xs ${n >= 45 ? "text-amber-500" : "text-slate-400"}`}>{n}/50</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {errors.tailor_id && <p className="text-xs text-red-500">{errors.tailor_id}</p>}
              </div>

              {/* Customer ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Customer ID</Label>
                <Input value={values.customer_ref_id} onChange={(e) => setValues((prev) => ({ ...prev, customer_ref_id: e.target.value }))} placeholder="C001" className="h-10" />
                {errors.customer_ref_id && <p className="text-xs text-red-500">{errors.customer_ref_id}</p>}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Quantity</Label>
                <Input type="number" min={1} value={values.quantity} onChange={(e) => setValues((prev) => ({ ...prev, quantity: e.target.value }))} className="h-10" />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
              </div>

              <Button type="submit" variant="default" disabled={isLoadingTailors} className="mt-12 h-10 w-full">
                <Plus className="mr-2 size-4" />Add Order
              </Button>
            </form>
          </div>

          {/* RIGHT PANEL WITH TABS */}
          <div className="flex flex-col overflow-hidden rounded-xl border bg-white lg:col-span-3">

            {/* Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("assign")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === "assign" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"}`}
              >
                <ClipboardList className="size-4" />
                Order List
                {stagedOrders.length > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                    {stagedOrders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${activeTab === "manage" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-700"}`}
              >
                <ListChecks className="size-4" />
                Manage Assigned
              </button>

              {/* Clear all — only on assign tab */}
              {activeTab === "assign" && stagedOrders.length > 0 && (
                <div className="ml-auto flex items-center pr-4">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setStagedOrders([])} className="text-slate-500">
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Tab content */}
            {activeTab === "assign" ? (
              <>
                <div className="overflow-y-auto p-5" style={{ height: "420px" }}>
                  {stagedOrders.length === 0 ? (
                    <div className="flex h-[200px] flex-col items-center justify-center text-center">
                      <ClipboardList className="mb-3 size-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-600">No orders added</p>
                      <p className="mt-1 text-xs text-slate-400">Fill the form and add orders to the list</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr className="border-b">
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Tailor</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                            <th className="px-4 py-3 text-left font-medium text-slate-500">Qty</th>
                            <th className="w-12" />
                          </tr>
                        </thead>
                        <tbody>
                          {stagedOrders.map((order) => (
                            <tr key={order.tempId} className="border-b last:border-0">
                              <td className="px-4 py-3 font-medium text-slate-800">{order.tailor_name}</td>
                              <td className="px-4 py-3 text-slate-600">{order.customer_ref_id}</td>
                              <td className="px-4 py-3 text-slate-600">{order.quantity}</td>
                              <td className="px-4 py-3 text-right">
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeStaged(order.tempId)} className="size-8 text-slate-400 hover:text-red-500">
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

                <div className="border-t bg-slate-50 px-5 py-4">
                  {stagedOrders.length > 0 ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-slate-400">Orders</p>
                          <p className="text-lg font-semibold text-slate-700">{stagedOrders.length}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Total Quantity</p>
                          <p className="text-lg font-semibold text-slate-900">{totalQuantity}</p>
                        </div>
                      </div>
                      <Button onClick={handleSubmitAll} disabled={isSubmitting} className="h-10 min-w-[180px]">
                        {isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</> : <><SendHorizonal className="mr-2 size-4" />Submit Orders</>}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No orders to submit</p>
                  )}
                </div>
              </>
            ) : (
              <ManageAssignedTab
                tailors={tailors}
                activeByTailor={activeByTailor}
                onChanged={() => {
                  queryClient.invalidateQueries({ queryKey: ["activeOrderCounts"] })
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}