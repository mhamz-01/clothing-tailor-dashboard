import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function AssignWorkHeader() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-gray-900">
        <ArrowLeft className="size-4" />
      </Link>
      <h1 className="text-xl font-bold text-gray-900">Assign Work</h1>
    </div>
  )
}