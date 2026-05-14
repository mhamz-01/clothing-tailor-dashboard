import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">404 — Page Not Found</h1>
      <p className="max-w-md text-slate-600">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/dashboard"
        className={cn(
          buttonVariants({ size: "lg" }),
          "bg-slate-900 text-white hover:bg-slate-800"
        )}
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
