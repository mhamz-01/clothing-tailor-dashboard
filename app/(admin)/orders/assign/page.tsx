"use client"

import { useState } from "react"
import { useTailors } from "@/hooks/tailors/use-tailor"
import { useActiveOrderCounts } from "@/hooks/assign-work/use-active-order-count"
import { useStagedOrders } from "@/hooks/assign-work/use-staged-orders"
import { useAssignOrderForm } from "@/hooks/assign-work/use-assign-orderforms"
import { useInsertOrders } from "@/hooks/assign-work/use-order-mutations"
import { AssignWorkHeader } from "@/components/assign-work/assign-work-header"
import { ErrorBanner } from "@/components/ui/error-banner"
import { OrderForm } from "@/components/assign-work/order-form"
import { TabsHeader } from "@/components/assign-work/tab-header"
import { AssignTabPanel } from "@/components/assign-work/assign-tab-panel"
import { ManageAssignedTab } from "@/components/assign-work/manage-assigned-tabs"

type Tab = "assign" | "manage"

export default function AssignWorkPage() {
  const [activeTab, setActiveTab] = useState<Tab>("assign")

  const { data: tailors = [], isLoading: isLoadingTailors, error: tailorsError } = useTailors()
  const { data: activeByTailor = new Map(), error: countsError } = useActiveOrderCounts()
  const loadError = tailorsError?.message ?? countsError?.message ?? null

  const { stagedOrders, totalQuantity, addStagedOrder, removeStagedOrder, clearStagedOrders, countStagedForTailor } = useStagedOrders()

  const { values, errors, setTailorId, setCustomerRef, setQuantity, handleSubmit, reset: resetForm } = useAssignOrderForm({
    tailors,
    activeByTailor,
    countStagedForTailor,
    onAdd: addStagedOrder,
  })

  const insertOrders = useInsertOrders()

  function handleSubmitAll() {
    if (stagedOrders.length === 0) return
    insertOrders.mutate(stagedOrders, {
      onSuccess: () => {
        clearStagedOrders()
        resetForm()
      },
    })
  }

  return (
    <div className="mx-auto max-w-8xl space-y-4 p-4 md:p-6">
      <AssignWorkHeader />
      <ErrorBanner message={loadError} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <OrderForm
          tailors={tailors}
          activeByTailor={activeByTailor}
          isLoadingTailors={isLoadingTailors}
          values={values}
          errors={errors}
          onTailorSelect={setTailorId}
          onCustomerRefChange={setCustomerRef}
          onQuantityChange={setQuantity}
          onSubmit={handleSubmit}
        />

        <div className="flex flex-col overflow-hidden rounded-xl border bg-white lg:col-span-3">
          <TabsHeader activeTab={activeTab} onTabChange={setActiveTab} stagedCount={stagedOrders.length} onClearAll={clearStagedOrders} />

          {activeTab === "assign" ? (
            <AssignTabPanel
              stagedOrders={stagedOrders}
              totalQuantity={totalQuantity}
              isSubmitting={insertOrders.isPending}
              onRemove={removeStagedOrder}
              onSubmit={handleSubmitAll}
            />
          ) : (
            <ManageAssignedTab tailors={tailors} activeByTailor={activeByTailor} />
          )}
        </div>
      </div>
    </div>
  )
}