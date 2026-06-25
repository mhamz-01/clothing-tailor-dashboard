import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function DeliverWorkHeader() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:text-gray-900">
        <ArrowLeft className="size-4" />
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Deliver Work</h1>
        <p className="text-sm text-gray-500">Manage and complete assigned orders</p>
      </div>
    </div>
  )
}