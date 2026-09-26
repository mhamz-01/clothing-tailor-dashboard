import { withAdminSession } from "@/lib/auth/admin"
import { deleteTailor } from "@/lib/queries/tailors"

export const DELETE = withAdminSession(
  async (_req: Request, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params
    await deleteTailor(id)
  }
)
