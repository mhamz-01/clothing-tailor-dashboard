"use client"

import type { ReactNode } from "react"
import { Noto_Nastaliq_Urdu } from "next/font/google"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Scoped to app/tailor/** only, deliberately separate from the fonts loaded
// by the root layout for the admin dashboard.
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
})

// Lives here (the layout shared by every app/tailor/** route) rather than
// down in app/tailor/(portal)/layout.tsx -- orders/shalwar-kameez is a
// sibling of the (portal) route group, not nested inside it, so a provider
// placed there alone never reaches it (see use-shalwar-kameez-form.ts's
// "No QueryClient set" error). One instance for the whole tailor module,
// separate from app/(admin)/layout.tsx's.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: true,
    },
  },
})

export default function TailorModuleLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={`${notoNastaliqUrdu.variable} min-h-screen`}>{children}</div>
    </QueryClientProvider>
  )
}
