'use client'
import type { ReactNode } from "react"
import { SidebarLayout } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

type AdminLayoutProps = {
  children: ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,        // data fresh for 30 seconds
      refetchOnWindowFocus: true,  // refetch when tab regains focus
    },
  },
})


export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
      <SidebarLayout>{children}</SidebarLayout>
      <Toaster />
      </QueryClientProvider>
    </>
  )
}