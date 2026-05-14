import type { ReactNode } from "react"
import { SidebarLayout } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

type AdminLayoutProps = {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <SidebarLayout>{children}</SidebarLayout>
      <Toaster />
    </>
  )
}