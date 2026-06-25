export function todayDateInputValue(): string {
    const d = new Date()
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