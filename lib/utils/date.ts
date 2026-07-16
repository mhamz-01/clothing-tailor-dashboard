export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function todayDateInputValue(): string {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  // Used to default a Shalwar Kameez order's Delivery Date to Book Date +
  // the tailor's configured turnaround (see order_pricing_settings /
  // use-shalwar-kameez-form.ts) -- local calendar days, not a 24h offset, so
  // DST transitions don't shift the result by a day.
  export function addDaysToDateInputValue(value: string, days: number): string {
    const [year, month, day] = value.split("-").map(Number)
    const d = new Date(year, month - 1, day + days)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }
  
  export function formatDueDate(value: string | null): string {
    if (!value) return "—"
    const [datePart] = value.split("T")
    const [year, month, day] = datePart.split("-")
    return `${day}/${month}/${year}`
  }

  export function formatDate(value: string | null): string {
    if (!value) return "—"
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  export function formatTimeRemaining(value: string | null): string {
    if (!value) return "Not logged in"
    const diffMs = new Date(value).getTime() - Date.now()
    if (diffMs <= 0) return "Session expired"

    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m left`
  }