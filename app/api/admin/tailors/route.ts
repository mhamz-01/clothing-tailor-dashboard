import { withAdminSession } from "@/lib/auth/admin"
import { fetchTailors, insertTailor } from "@/lib/queries/tailors"

export const GET = withAdminSession(async () => ({ tailors: await fetchTailors() }))

export const POST = withAdminSession(async (req: Request) => {
  await insertTailor(await req.json())
})
