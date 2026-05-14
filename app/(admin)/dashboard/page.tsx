import Link from "next/link"
import {
  Calendar,
  CheckCircle,
  Clock,
  Package,
  type LucideIcon,
} from "lucide-react"

import { createClient } from "@/lib/supabase/server"

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function toIso(date: Date) {
  return date.toISOString()
}

async function getDashboardStats() {
  const supabase = await createClient()

  const now = new Date()
  const dayStart = startOfDay(now)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const monthStart = startOfMonth(now)
  const monthOrdersEndExclusive = dayStart

  const [
    ordersToday,
    ordersMonthly,
    pendingOrders,
    deliveredToday,
    deliveredMonthly,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", toIso(dayStart))
      .lt("created_at", toIso(dayEnd)),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", toIso(monthStart))
      .lt("created_at", toIso(monthOrdersEndExclusive)),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "assigned"),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered")
      .gte("delivered_at", toIso(dayStart))
      .lt("delivered_at", toIso(dayEnd)),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "delivered")
      .gte("delivered_at", toIso(monthStart))
      .lt("delivered_at", toIso(monthOrdersEndExclusive)),
  ])

  const errors = [
    ordersToday.error,
    ordersMonthly.error,
    pendingOrders.error,
    deliveredToday.error,
    deliveredMonthly.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw new Error("Failed to fetch dashboard stats.")
  }

  return {
    totalOrdersToday: ordersToday.count ?? 0,
    totalOrdersMonthly: ordersMonthly.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    deliveredToday: deliveredToday.count ?? 0,
    deliveredMonthly: deliveredMonthly.count ?? 0,
  }
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: number
  icon: LucideIcon
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">
            {value}
          </h3>
        </div>

        <div className="rounded-lg border bg-slate-50 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center justify-center rounded-lg border bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
    >
      {label}
    </Link>
  )
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-8 p-6">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Overview of orders and delivery activity
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            <span>{today}</span>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <StatCard
            title="Orders Today"
            value={stats.totalOrdersToday}
            icon={Calendar}
          />

          <StatCard
            title="Orders This Month"
            value={stats.totalOrdersMonthly}
            icon={Package}
          />

          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
          />

          <StatCard
            title="Delivered Today"
            value={stats.deliveredToday}
            icon={CheckCircle}
          />

          <StatCard
            title="Delivered This Month"
            value={stats.deliveredMonthly}
            icon={CheckCircle}
          />

        </section>

        {/* Quick Actions */}
        <section className="rounded-xl border bg-white p-5">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Common management tasks
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton
              href="/tailors/add"
              label="Add Tailor"
            />

            <ActionButton
              href="/orders/assign"
              label="Assign Work"
            />

            <ActionButton
              href="/orders/deliver"
              label="Deliver Work"
            />
          </div>
        </section>

      </div>
    </div>
  )
}