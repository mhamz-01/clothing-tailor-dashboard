"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchOrderHistory } from "@/lib/queries"
import { cn } from "@/lib/utils"

function formatDate(val: string | null) {
  if (!val) return "—"
  const d = new Date(val)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export default function HistoryPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "delivered">("all")

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orderHistory"],
    queryFn: fetchOrderHistory,
  })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return orders.filter((o: any) => {
      const matchesSearch =
        !q ||
        o.customer_ref_id.toLowerCase().includes(q) ||
        (o.tailor?.name ?? "").toLowerCase().includes(q) ||
        (o.comment ?? "").toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Order History</h1>
        <p className="text-sm text-gray-400">Complete record of all assigned and delivered orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Search tailor, customer, comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-gray-200 text-sm"
          />
        </div>

        {/* Status tabs */}
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
          {(["all", "assigned", "delivered"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition",
                statusFilter === s
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 sm:ml-auto">
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center">
          <p className="text-sm font-medium text-gray-500">No records found</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
  <div className="overflow-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
          <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200 bg-gray-50">
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">#</th>
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">Tailor</th>
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">Customer ID</th>
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">Qty</th>
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">Assigned On</th>
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">Delivered On</th>
                <th className="border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Comment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order: any, index: number) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="border-r border-gray-100 px-4 py-3 text-xs text-gray-400">{index + 1}</td>
                  <td className="border-r border-gray-100 px-4 py-3 font-semibold text-gray-900">{order.tailor?.name ?? "—"}</td>
                  <td className="border-r border-gray-100 px-4 py-3 text-gray-700">{order.customer_ref_id}</td>
                  <td className="border-r border-gray-100 px-4 py-3 text-gray-600">{order.quantity ?? "—"}</td>
                  <td className="border-r border-gray-100 px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.created_at)}</td>
                  <td className="border-r border-gray-100 px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(order.delivered_at)}</td>
                  <td className="border-r border-gray-100 px-4 py-3">
                    <span className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      order.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    )}>
                      {order.status === "delivered" ? "Delivered" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 italic">{order.comment || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  )
}