import { withAdminSession } from "@/lib/auth/admin"
import { updateOrderTailor } from "@/lib/queries/orders"

export const PATCH = withAdminSession(
  async (req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params
    const { tailorId } = await req.json()
    await updateOrderTailor(id, tailorId)
  }
)
