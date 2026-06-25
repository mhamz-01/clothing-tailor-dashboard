"use client"

import { useCallback, useMemo, useState } from "react"
import { ListChecks } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/use-debounced-values"
import { useAssignedOrdersManage } from "@/hooks/use-assigned-orders-manage"
import { useUpdateOrderTailor } from "@/hooks/use-order-mutations"
import { ManageAssignedRow } from "./manage-assigned-rows"
import type { TailorRow } from "@/types/assign-work"

export function ManageAssignedTab({ tailors, activeByTailor }: { tailors: TailorRow[]; activeByTailor: Map<string, number> }) {
  const { data: orders = [], isLoading } = useAssignedOrdersManage()
  const updateTailor = useUpdateOrderTailor()

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 200)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTailorId, setEditTailorId] = useState("")

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim()
    if (!q) return orders
    return orders.filter((o) => o.customer_ref_id.toLowerCase() === q || (o.tailor?.name ?? "").toLowerCase().includes(q))
  }, [orders, debouncedSearch])

  const startEdit = useCallback((orderId: string, currentTailorId: string) => {
    setEditingId(orderId)
    setEditTailorId(currentTailorId)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditTailorId("")
  }, [])

  const handleSave = useCallback((orderId: string) => {
    if (!editTailorId) return
    updateTailor.mutate({ orderId, tailorId: editTailorId }, { onSuccess: cancelEdit })
  }, [editTailorId, updateTailor, cancelEdit])

  if (isLoading) {
    return (
      <div className="space-y-2 p-5">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: "520px" }}>
      <div className="p-4 border-b">
        <Input placeholder="Search by customer or tailor..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 text-sm" />
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
              {filtered.map((order) => (
                <ManageAssignedRow
                  key={order.id}
                  order={order}
                  tailors={tailors}
                  activeByTailor={activeByTailor}
                  isEditing={editingId === order.id}
                  editTailorId={editingId === order.id ? editTailorId : ""}
                  isSaving={updateTailor.isPending && updateTailor.variables?.orderId === order.id}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  onEditTailorSelect={setEditTailorId}
                  onSave={handleSave}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}