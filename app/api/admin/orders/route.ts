import { withAdminSession } from "@/lib/auth/admin"
import { insertOrders } from "@/lib/queries/orders"
import { fetchOrderHistory } from "@/lib/queries/history"

export const GET = withAdminSession(async () => ({ orders: await fetchOrderHistory() }))

export const POST = withAdminSession(async (req: Request) => {
  const { orders } = await req.json()
  await insertOrders(orders)
})
