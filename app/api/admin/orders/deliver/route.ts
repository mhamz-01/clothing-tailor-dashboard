import { withAdminSession } from "@/lib/auth/admin"
import { deliverOrders } from "@/lib/queries/orders"

export const POST = withAdminSession(async (req: Request) => {
  const { deliveries } = await req.json()
  await deliverOrders(deliveries)
})
