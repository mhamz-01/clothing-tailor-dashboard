"use client"

import { cn } from "@/lib/utils"
import type { StatusFilter } from "@/hooks/use-order-history-filters"
const STATUS_OPTIONS: StatusFilter[] = ["all", "assigned", "delivered"]

interface StatusFilterTabsProps {
  value: StatusFilter
  onChange: (status: StatusFilter) => void
}

export function StatusFilterTabs({ value, onChange }: StatusFilterTabsProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 bg-white p-1 gap-1">
      {STATUS_OPTIONS.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition",
            value === status ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
          )}
        >
          {status}
        </button>
      ))}
    </div>
  )
}