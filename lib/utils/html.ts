// Shared by the standalone print documents (receipt.ts, garment-order-sheet.ts):
// they are built as plain HTML strings, so every interpolated value must be
// escaped here rather than by a framework.
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      default:
        return "&#39;"
    }
  })
}
