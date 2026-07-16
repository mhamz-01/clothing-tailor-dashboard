"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

// QueryClientProvider lives up in app/tailor/layout.tsx instead -- it needs
// to cover orders/shalwar-kameez too, which is a sibling of this (portal)
// route group, not nested inside it.
export default function TailorPortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/tailor-logout", { method: "POST" })
    router.push("/tailor/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-10 flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm hover:text-slate-900"
      >
        <LogOut className="size-3.5" />
        Logout
      </button>
      {children}
    </div>
  )
}
