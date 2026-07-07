"use client"

import { useCallback, useMemo, useState } from "react"
import { useAssignedOrders } from "@/hooks/deliver-work/use-assigned-orders"
import { useStagedDeliveries } from "@/hooks/deliver-work/use-staged-deliveries"
import { useDeliverOrdersMutation } from "@/hooks/deliver-work/use-deliver-order-mutations"
import { useDebouncedValue } from "@/hooks/shared/use-debounced-value"
import { DeliverWorkHeader } from "@/components/deliver-work/deliver-work-header"
import { OrderSearchInput } from "@/components/deliver-work/order-search-input"
import { OrdersPanel } from "@/components/deliver-work/orders-panel"
import { DeliveryQueuePanel } from "@/components/deliver-work/delivery-queue-panel"
import { ConfirmDeliveryDialog } from "@/components/deliver-work/confirm-delivery-dialog"
import type { DeliverableOrder } from "@/types/deliver-work"
export default function DeliverWorkPage() {
  const { data: orders = [], isLoading: isInitialLoading } = useAssignedOrders()

  const [comments, setComments] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 200)

  const { checkedIds, stagedDeliveries, totalQuantity, toggleOrder, toggleAll, removeFromStaged, clearStaged } = useStagedDeliveries()
  const deliverOrders = useDeliverOrdersMutation()

  const filteredOrders = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim()
    if (!q) return orders
    return orders.filter(
      (o: DeliverableOrder) => o.customer_ref_id.toLowerCase() === q || (o.tailor?.name ?? "").toLowerCase().includes(q)
    )
  }, [orders, debouncedSearch])

  const totalPendingQuantity = useMemo(
    () => filteredOrders.reduce((sum, order) => sum + (order.quantity ?? 0), 0),
    [filteredOrders]
  )

  const handleCommentChange = useCallback((orderId: string, value: string) => {
    setComments((prev) => ({ ...prev, [orderId]: value }))
  }, [])

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      toggleAll(filteredOrders, checked, comments)
    },
    [toggleAll, filteredOrders, comments]
  )

  function handleConfirmDelivery() {
    deliverOrders.mutate(stagedDeliveries, {
      onSuccess: () => {
        clearStaged()
        setConfirmOpen(false)
      },
    })
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-2">
      <DeliverWorkHeader />
      <OrderSearchInput value={search} onChange={setSearch} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[65%35%]">
        <OrdersPanel
          orders={filteredOrders}
          isLoading={isInitialLoading}
          comments={comments}
          checkedIds={checkedIds}
          selectedCount={checkedIds.size}
          totalQuantity={totalPendingQuantity}
          onToggleOrder={toggleOrder}
          onToggleAll={handleToggleAll}
          onCommentChange={handleCommentChange}
        />

        <DeliveryQueuePanel
          deliveries={stagedDeliveries}
          totalQuantity={totalQuantity}
          onRemove={removeFromStaged}
          onClear={clearStaged}
          onDeliverClick={() => setConfirmOpen(true)}
        />
      </div>

      <ConfirmDeliveryDialog
        open={confirmOpen}
        onOpenChange={(open) => { if (!open) setConfirmOpen(false) }}
        orderCount={stagedDeliveries.length}
        isDelivering={deliverOrders.isPending}
        onConfirm={handleConfirmDelivery}
      />
    </div>
  )
}