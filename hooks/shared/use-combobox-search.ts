"use client"

import { useMemo, useState, type KeyboardEvent } from "react"
import { COMBOBOX_CLOSE_DELAY_MS } from "@/lib/constants/ui"

interface UseComboboxSearchOptions<T> {
  items: T[]
  getLabel: (item: T) => string
  isDisabled?: (item: T) => boolean
  onSelect: (item: T) => void
}

export function useComboboxSearch<T>({ items, getLabel, isDisabled, onSelect }: UseComboboxSearchOptions<T>) {
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return items
    return items.filter((item) => getLabel(item).toLowerCase().includes(q))
  }, [items, search, getLabel])

  function open() {
    setIsOpen(true)
  }

  function closeWithDelay() {
    setTimeout(() => setIsOpen(false), COMBOBOX_CLOSE_DELAY_MS)
  }

  function selectItem(item: T) {
    if (isDisabled?.(item)) return
    onSelect(item)
    setSearch("")
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setFocusedIndex(-1)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!isOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setFocusedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setFocusedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = filteredItems[focusedIndex]
      if (item) selectItem(item)
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  return { search, isOpen, focusedIndex, filteredItems, open, closeWithDelay, selectItem, handleSearchChange, handleKeyDown, setFocusedIndex }
}
