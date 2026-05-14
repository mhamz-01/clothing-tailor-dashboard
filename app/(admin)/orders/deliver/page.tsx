"use client"

import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PackageCheck,
  AlertTriangle,
  Search,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { fetchAssignedOrders } from "@/lib/queries"

// ─── Types ────────────────────────────────────────────────────────────────────

type AssignedOrderRow = {
  id: string
  customer_ref_id: string
  // due_date: string
  status: string
  created_at: string
  quantity: number | null
  tailor: { name: string } | null
}

type StagedDelivery = {
  id: string
  customer_ref_id: string
  tailor_name: string
  // due_date: string
  quantity: number | null
  comment: string
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

// function startOfLocalToday() {
//   const now = new Date()
//   return new Date(now.getFullYear(), now.getMonth(), now.getDate())
// }

// function parseLocalDate(ymd: string) {
//   const part = ymd.split("T")[0] ?? ymd
//   const [y, m, d] = part.split("-").map(Number)
//   return new Date(y, (m ?? 1) - 1, d ?? 1)
// }

// function formatDate(due: string) {
//   const part = due.split("T")[0] ?? due
//   const [y, m, d] = part.split("-")
//   if (!y || !m || !d) return part
//   return `${d}/${m}/${y}`
// }

// function dueDayDiff(dueDate: string) {
//   const due = parseLocalDate(dueDate)
//   const today = startOfLocalToday()
//   return Math.round((due.getTime() - today.getTime()) / 86400000)
// }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: 7 }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-4 w-16 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-t border-gray-100">
              {Array.from({ length: 7 }).map((__, j) => (
                <td key={j} className="px-4 py-4">
                  <Skeleton className="h-4 w-full rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Timeline Badge ───────────────────────────────────────────────────────────

// function TimelineBadge({ diff }: { diff: number }) {
//   if (diff > 0) {
//     return (
//       <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
//         {diff}d left
//       </span>
//     )
//   }
//   if (diff === 0) {
//     return (
//       <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
//         Due today
//       </span>
//     )
//   }
//   return (
//     <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
//       {Math.abs(diff)}d overdue
//     </span>
//   )
// }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeliverWorkPage() {
  const queryClient = useQueryClient()

  // ── TanStack Query ────────────────────────────────────────────────────────────

  const { data: orders = [], isLoading: isInitialLoading } = useQuery({
    queryKey: ["assignedOrders"],
    queryFn: fetchAssignedOrders,
    refetchInterval: 60_000,
  })

  // ── Local state ───────────────────────────────────────────────────────────────

  const [comments, setComments] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [stagedDeliveries, setStagedDeliveries] = useState<StagedDelivery[]>([])
  const [isDelivering, setIsDelivering] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalQuantity = stagedDeliveries.reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  )

  // ── Derived ───────────────────────────────────────────────────────────────────

  // const overdueCount = useMemo(
  //   () => orders.filter((o: AssignedOrderRow) => dueDayDiff(o.due_date) < 0).length,
  //   [orders]
  // )

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return orders
    return orders.filter(
      (o: AssignedOrderRow) =>
        o.customer_ref_id.toLowerCase().includes(q) ||
        (o.tailor?.name ?? "").toLowerCase().includes(q)
    )
  }, [orders, search])

  const totalPendingQuantity = filteredOrders.reduce(
    (sum, order) => sum + (order.quantity ?? 0),
    0
  )

  // ── Checkbox logic ────────────────────────────────────────────────────────────

  function handleCheck(order: AssignedOrderRow, checked: boolean) {
    const updated = new Set(checkedIds)

    if (checked) {
      updated.add(order.id)
      setStagedDeliveries((prev) => {
        if (prev.find((p) => p.id === order.id)) return prev
        return [
          ...prev,
          {
            id: order.id,
            customer_ref_id: order.customer_ref_id,
            tailor_name: order.tailor?.name ?? "—",
            // due_date: order.due_date,
            quantity: order.quantity,
            comment: comments[order.id] ?? "",
          },
        ]
      })
    } else {
      updated.delete(order.id)
      setStagedDeliveries((prev) => prev.filter((p) => p.id !== order.id))
    }

    setCheckedIds(updated)
  }

  function removeFromStaged(id: string) {
    const updated = new Set(checkedIds)
    updated.delete(id)
    setCheckedIds(updated)
    setStagedDeliveries((prev) => prev.filter((p) => p.id !== id))
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async function handleDeliverAll() {
    if (stagedDeliveries.length === 0) return
    setIsDelivering(true)
    const supabase = createClient()

    try {
      const updates = stagedDeliveries.map((s) =>
        supabase
          .from("orders")
          .update({
            status: "delivered",
            delivered_at: new Date().toISOString(),
            comment: s.comment.trim() || null,
          })
          .eq("id", s.id)
      )

      const results = await Promise.all(updates)
      const failed = results.filter((r) => r.error)

      if (failed.length > 0) {
        toast({
          title: "Some orders failed",
          description: "Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `${stagedDeliveries.length} order${stagedDeliveries.length > 1 ? "s" : ""} delivered successfully.`,
      })

      setCheckedIds(new Set())
      setStagedDeliveries([])
      setConfirmOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["assignedOrders"] })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Unexpected error.",
        variant: "destructive",
      })
    } finally {
      setIsDelivering(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-2">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Deliver Work</h1>
            <p className="text-sm text-gray-500">Manage and complete assigned orders</p>
          </div>
        </div>

        {/* Alert */}
        {/* {overdueCount > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle className="size-4 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              {overdueCount} overdue order{overdueCount > 1 ? "s" : ""} require attention
            </p>
          </div>
        )} */}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by customer or tailor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 rounded-xl border-gray-200 bg-white pl-10 text-sm"
          />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[65%35%]">

          {/* ── LEFT: Orders Table ── */}
          <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">

<div className="flex items-center gap-6">
  <div>
    <p className="text-[11px] text-gray-400">
      Pending Orders
    </p>

    <p className="text-sm font-semibold text-gray-800">
      {filteredOrders.length}
    </p>
  </div>

  <div>
    <p className="text-[11px] text-gray-400">
      Total Qty
    </p>

    <p className="text-sm font-semibold text-gray-900">
      {totalPendingQuantity}
    </p>
  </div>
</div>

{checkedIds.size > 0 && (
  <div className="rounded-lg bg-indigo-50 px-3 py-1.5">
    <p className="text-sm font-medium text-indigo-600">
      {checkedIds.size} selected
    </p>
  </div>
)}
</div>

            {isInitialLoading ? (
              <TableSkeleton />
            ) : filteredOrders.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center">
                <CheckCircle2 className="mb-3 size-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No orders found</p>
                <p className="mt-1 text-xs text-gray-400">Try another search keyword</p>
              </div>
            ) : (
              <div className="overflow-auto rounded-2xl border border-gray-200 bg-white h-[470px]">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      <th className="w-10 px-4 py-3" />
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Tailor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Qty</th>
                      {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Timeline</th> */}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order: AssignedOrderRow) => {
                      // const diff = dueDayDiff(order.due_date)
                      // const isOverdue = diff < 0
                      // const isDueToday = diff === 0
                      // const isChecked = checkedIds.has(order.id)

                      return (
                        <tr
                          key={order.id}
                          className={cn(
                            "border-b border-gray-100 transition-colors",
                            // isChecked
                            //   ? "bg-indigo-50"
                            //   : isOverdue
                            //     ? "bg-red-50"
                            //     : isDueToday
                            //       ? "bg-amber-50"
                            //       : "bg-white hover:bg-gray-50"
                          )}
                        >
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              // checked={isChecked}
                              onChange={(e) => handleCheck(order, e.target.checked)}
                              className="size-4 cursor-pointer rounded border-gray-300 accent-indigo-600"
                            />
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.customer_ref_id}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{order.tailor?.name ?? "—"}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{order.quantity ?? "—"}</td>
                          {/* <td className="px-4 py-4 text-sm text-gray-600">{formatDate(order.due_date)}</td> */}
                          {/* <td className="px-4 py-4"><TimelineBadge diff={diff} /></td> */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              placeholder="Comment..."
                              value={comments[order.id] ?? ""}
                              onChange={(e) =>
                                setComments((prev) => ({ ...prev, [order.id]: e.target.value }))
                              }
                              className="w-full min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── RIGHT: Delivery Queue ── */}
          <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">

            {/* Header */}
            <div className="border-b border-gray-100 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Delivery Queue</h2>
                  <div className="mt-2 flex items-center gap-5">
  <div>
    <p className="text-[11px] text-gray-400">
      Orders
    </p>

    <p className="text-sm font-semibold text-gray-800">
      {stagedDeliveries.length}
    </p>
  </div>

  <div>
    <p className="text-[11px] text-gray-400">
      Total Qty
    </p>

    <p className="text-sm font-semibold text-indigo-600">
      {totalQuantity}
    </p>
  </div>
</div>
                </div>
                {stagedDeliveries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckedIds(new Set())
                      setStagedDeliveries([])
                    }}
                    className="text-xs font-medium text-gray-400 transition hover:text-red-500"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {stagedDeliveries.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                  <PackageCheck className="mb-3 size-10 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">No orders selected</p>
                  <p className="mt-1 text-xs text-gray-400">Select orders from the table</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Tailor</th>
                      <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Customer</th>
                      <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Qty</th>
                      {/* <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Due</th> */}
                      <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-500">Comment</th>
                      <th className="border border-gray-200 px-2 py-2 w-6" />
                    </tr>
                  </thead>
                  <tbody>
                    {stagedDeliveries.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 transition hover:bg-gray-50">
                        <td className="border border-gray-200 px-2 py-2 font-semibold text-gray-900">{s.tailor_name}</td>
                        <td className="border border-gray-200 px-2 py-2 text-gray-600">{s.customer_ref_id}</td>
                        <td className="border border-gray-200 px-2 py-2 text-gray-600">{s.quantity ?? "—"}</td>
                        {/* <td className="border border-gray-200 px-2 py-2 text-gray-600 whitespace-nowrap">{formatDate(s.due_date)}</td> */}
                        <td className="border border-gray-200 px-2 py-2 text-gray-500 italic">{s.comment || "—"}</td>
                        <td className="border border-gray-200 px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeFromStaged(s.id)}
                            className="text-gray-300 transition hover:text-red-500"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4">
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={stagedDeliveries.length === 0}
                className="h-11 w-full rounded-xl bg-black text-sm font-medium hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-50"
              >
                <PackageCheck className="mr-2 size-4" />
                Deliver Orders
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={(o) => { if (!o) setConfirmOpen(false) }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50">
              <PackageCheck className="size-5 text-emerald-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Confirm delivery
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500">
              You are about to mark{" "}
              <span className="font-semibold text-gray-800">
                {stagedDeliveries.length} order{stagedDeliveries.length > 1 ? "s" : ""}
              </span>{" "}
              as delivered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDelivering}
              onClick={() => void handleDeliverAll()}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isDelivering ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Delivering...
                </>
              ) : (
                "Confirm Delivery"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}