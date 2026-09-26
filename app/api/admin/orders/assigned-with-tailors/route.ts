import { withAdminSession } from "@/lib/auth/admin"
import { fetchAssignedOrdersWithTailors } from "@/lib/queries/orders"

export const GET = withAdminSession(async () => ({ orders: await fetchAssignedOrdersWithTailors() }))
