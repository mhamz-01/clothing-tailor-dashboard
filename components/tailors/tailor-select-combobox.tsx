"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useComboboxSearch } from "@/hooks/shared/use-combobox-search"
import type { TailorRow } from "@/types/assign-work"

const DROPDOWN_MAX_HEIGHT_PX = 220

interface TailorSelectComboboxProps {
  tailors: TailorRow[]
  selectedTailorId: string
  onSelect: (tailorId: string) => void
  placeholder?: string
}

export function TailorSelectCombobox({
  tailors,
  selectedTailorId,
  onSelect,
  placeholder = "Search tailor...",
}: TailorSelectComboboxProps) {
  const selectedTailor = tailors.find((t) => t.id === selectedTailorId)
  const containerRef = useRef<HTMLDivElement>(null)
  const [openUpward, setOpenUpward] = useState(false)

  const combobox = useComboboxSearch({
    items: tailors,
    getLabel: (t) => t.name,
    onSelect: (t) => onSelect(t.id),
  })

  function handleFocus() {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUpward(spaceBelow < DROPDOWN_MAX_HEIGHT_PX && rect.top > spaceBelow)
    }
    combobox.open()
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder={placeholder}
        value={combobox.search || selectedTailor?.name || ""}
        onChange={(e) => {
          combobox.handleSearchChange(e.target.value)
          if (selectedTailorId) onSelect("")
        }}
        onFocus={handleFocus}
        onBlur={combobox.closeWithDelay}
        onKeyDown={combobox.handleKeyDown}
        autoComplete="off"
        className="h-10"
      />
      {combobox.isOpen && (
        <div
          className={cn(
            "absolute z-50 w-full overflow-hidden rounded-lg border bg-white shadow-lg",
            openUpward ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="max-h-52 overflow-y-auto">
            {combobox.filteredItems.length === 0 ? (
              <div className="px-3 py-3 text-sm text-slate-500">No tailor found</div>
            ) : (
              combobox.filteredItems.map((t, index) => {
                const isFocused = combobox.focusedIndex === index
                return (
                  <button
                    key={t.id}
                    type="button"
                    onMouseDown={() => combobox.selectItem(t)}
                    onMouseEnter={() => combobox.setFocusedIndex(index)}
                    className={cn(
                      "flex w-full items-center px-3 py-2.5 text-sm font-medium transition-colors",
                      isFocused ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50"
                    )}
                  >
                    {t.name}
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
