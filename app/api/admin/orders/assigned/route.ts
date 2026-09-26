import { withAdminSession } from "@/lib/auth/admin"
import { fetchAssignedOrders } from "@/lib/queries/orders"

export const GET = withAdminSession(async () => ({ orders: await fetchAssignedOrders() }))
