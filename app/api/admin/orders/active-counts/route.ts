import { withAdminSession } from "@/lib/auth/admin"
import { fetchActiveOrderCounts } from "@/lib/queries/orders"

export const GET = withAdminSession(async () => ({
  counts: Object.fromEntries(await fetchActiveOrderCounts()),
}))
