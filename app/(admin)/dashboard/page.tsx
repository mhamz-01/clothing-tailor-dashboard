"use client"

import Link from "next/link"
import { Calendar, CheckCircle, Clock, Package, type LucideIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchDashboardStats } from "@/lib/queries"

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">{value}</h3>
        </div>
        <div className="rounded-lg border bg-slate-50 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return <div className="rounded-xl border bg-white p-5"><Skeleton className="h-16 w-full" /></div>
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
      {label}
    </Link>
  )
}

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date())

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6">

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Overview of orders and delivery activity</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>{today}</span>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !stats ? (
            Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          ) : (
            <>
              <StatCard title="Orders Today" value={stats.totalOrdersToday} icon={Calendar} />
              <StatCard title="Orders This Month" value={stats.totalOrdersMonthly} icon={Package} />
              <StatCard title="Pending Orders" value={stats.pendingOrders} icon={Clock} />
              <StatCard title="Delivered Today" value={stats.deliveredToday} icon={CheckCircle} />
              <StatCard title="Delivered This Month" value={stats.deliveredMonthly} icon={CheckCircle} />
            </>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-slate-900">Quick Actions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Common management tasks</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionButton href="/tailors/add" label="Add Tailor" />
            <ActionButton href="/orders/assign" label="Assign Work" />
            <ActionButton href="/orders/deliver" label="Deliver Work" />
          </div>
        </section>

      </div>
    </div>
  )
}