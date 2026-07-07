"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { StatusFilterTabs } from "./status-filter-tabs"
import type { StatusFilter } from "@/types"

interface HistoryFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (status: StatusFilter) => void
  resultCount: number
}

export function HistoryFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  resultCount,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <Input
          placeholder="Search tailor, customer, comment..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-white border-gray-200 text-sm"
        />
      </div>

      <StatusFilterTabs value={statusFilter} onChange={onStatusFilterChange} />

      <p className="text-xs text-gray-400 sm:ml-auto">
        {resultCount} record{resultCount !== 1 ? "s" : ""}
      </p>
    </div>
  )
}