import { cn } from "@/lib/utils"
import type { Order } from "@/types"

interface StatusBadgeProps {
  status: Order["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isDelivered = status === "delivered"

  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        isDelivered ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}
    >
      {isDelivered ? "Delivered" : "Pending"}
    </span>
  )
}