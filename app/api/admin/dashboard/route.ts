import { withAdminSession } from "@/lib/auth/admin"
import { fetchDashboardStats } from "@/lib/queries/dashboard"

export const GET = withAdminSession(async (req: Request) => {
  const params = new URL(req.url).searchParams
  return fetchDashboardStats({
    dayStart: params.get("dayStart") ?? "",
    dayEnd: params.get("dayEnd") ?? "",
    monthStart: params.get("monthStart") ?? "",
  })
})
// dum