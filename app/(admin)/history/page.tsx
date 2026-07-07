"use client"

import { useOrderHistory } from "@/hooks/history/use-order-history"
import { useOrderHistoryFilters } from "@/hooks/history/use-order-history-filters"
import { HistoryHeader } from "@/components/history/history-header"
import { HistoryFilters } from "@/components/history/history-filters"
import { OrderHistoryTable } from "@/components/history/order-history-table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { HistoryEmptyState } from "@/components/history/empty-state"
export default function HistoryPage() {
  const { data: orders = [], isLoading } = useOrderHistory()
  const { search, setSearch, statusFilter, setStatusFilter, filtered } =
    useOrderHistoryFilters(orders)

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
      <HistoryHeader />

      <HistoryFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        resultCount={filtered.length}
      />

      {isLoading ? (
        <TableSkeleton columns={8} rows={6} />
      ) : filtered.length === 0 ? (
        <HistoryEmptyState />
      ) : (
        <OrderHistoryTable orders={filtered} />
      )}
    </div>
  )
}