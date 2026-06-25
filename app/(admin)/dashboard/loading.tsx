import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatSkeleton } from "@/components/stats-card/stat-skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-5 w-56" />
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatSkeleton />
        <StatSkeleton />
      </section>

      <section>
        <StatSkeleton />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatSkeleton />
        <StatSkeleton />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </section>
    </div>
  )
}
