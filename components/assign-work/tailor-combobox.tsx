"use client"

import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useComboboxSearch } from "@/hooks/shared/use-combobox-search"
import { MAX_ACTIVE_ORDERS_PER_TAILOR, TAILOR_LOAD_WARNING_THRESHOLD } from "@/lib/constants/orders"
import type { TailorRow } from "@/types/assign-work"

interface TailorComboboxProps {
  tailors: TailorRow[]
  activeByTailor: Map<string, number>
  selectedTailorId: string
  onSelect: (tailorId: string) => void
  disabled?: boolean
  isLoading?: boolean
  size?: "sm" | "md"
}

export function TailorCombobox({
  tailors,
  activeByTailor,
  selectedTailorId,
  onSelect,
  disabled = false,
  isLoading = false,
  size = "md",
}: TailorComboboxProps) {
  const selectedTailor = tailors.find((t) => t.id === selectedTailorId)

  const combobox = useComboboxSearch({
    items: tailors,
    getLabel: (t) => t.name,
    isDisabled: (t) => (activeByTailor.get(t.id) ?? 0) >= MAX_ACTIVE_ORDERS_PER_TAILOR,
    onSelect: (t) => onSelect(t.id),
  })

  return (
    <div className="relative">
      <Input
        placeholder="Search tailor..."
        disabled={disabled}
        value={combobox.search || selectedTailor?.name || ""}
        onChange={(e) => {
          combobox.handleSearchChange(e.target.value)
          if (selectedTailorId) onSelect("")
        }}
        onFocus={combobox.open}
        onBlur={combobox.closeWithDelay}
        onKeyDown={combobox.handleKeyDown}
        autoComplete="off"
        style={disabled && selectedTailor ? { color: "#0f172a", fontWeight: 600, opacity: 1 } : undefined}
        className={cn(size === "sm" ? "h-8 text-xs" : "h-10", disabled && "bg-slate-100 cursor-not-allowed")}
      />
      {combobox.isOpen && (
        <div className={cn("absolute z-50 mt-1 overflow-hidden rounded-lg border bg-white shadow-lg", size === "sm" ? "w-48" : "w-full")}>
          <div className={cn("overflow-y-auto", size === "sm" ? "max-h-40" : "max-h-52")}>
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </div>
            ) : combobox.filteredItems.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500">No tailor found</div>
            ) : (
              combobox.filteredItems.map((t, index) => {
                const count = activeByTailor.get(t.id) ?? 0
                const atCap = count >= MAX_ACTIVE_ORDERS_PER_TAILOR
                const isFocused = combobox.focusedIndex === index
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={atCap}
                    onMouseDown={() => combobox.selectItem(t)}
                    onMouseEnter={() => combobox.setFocusedIndex(index)}
                    className={cn(
                      "flex w-full items-center justify-between text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      size === "sm" ? "px-3 py-2 text-xs" : "px-3 py-2.5",
                      isFocused ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"
                    )}
                  >
                    <span className={size === "sm" ? "" : "font-medium"}>{t.name}</span>
                    <span className={cn("text-xs", count >= TAILOR_LOAD_WARNING_THRESHOLD ? "text-amber-500" : "text-slate-400")}>
                      {count}/{MAX_ACTIVE_ORDERS_PER_TAILOR}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}