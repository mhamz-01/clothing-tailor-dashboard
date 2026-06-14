"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Scissors, Package, CheckCircle, History } from "lucide-react"
import Image from "next/image"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Add Tailor", href: "/tailors/add", icon: Scissors },
  { label: "Assign Work", href: "/orders/assign", icon: Package },
  { label: "Deliver Work", href: "/orders/deliver", icon: CheckCircle },
]

function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="bg-black text-white border-r border-slate-800">
  <SidebarHeader className="border-b bg-black border-slate-800  px-4 py-4">
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center ">
        <Image src="/paradise-tailor-logo-darkbackground.png" alt="Paradise Tailor" width={32} height={32} />
      </div>
      <div>
        <p className="text-lg font-bold text-white">Paradise Tailor</p>
      </div>
    </div>
  </SidebarHeader>

  <SidebarContent className="bg-black">
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-2">
        {navItems.map((item) => {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  return (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
  
  isActive={isActive}
  className={`h-11 w-full text-lg ${
    isActive
      ? "bg-white/15 text-white "
      : "text-slate-200 hover:bg-white/10 hover:text-white"
  }`}
>
  <Link href={item.href} className="flex w-full items-center gap-4 px-3">
    <item.icon className="size-5" />
    <span className="font-medium">{item.label}</span>
  </Link>
</SidebarMenuButton>
    </SidebarMenuItem>
  )
})}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarContent>

  <SidebarFooter className="border-t border-slate-800 bg-black px-3 py-3 space-y-3">
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={pathname === "/history"}
        className={`h-9 w-full text-sm ${
          pathname === "/history"
            ? "bg-white/15 text-white"
            : "text-slate-500 hover:bg-white/10 hover:text-slate-300"
        }`}
      >
        <Link href="/history" className="flex w-full items-center gap-3 px-2">
          <History className="size-4" />
          <span>Order Records</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
  {/* <p className="text-xs text-slate-600 px-1">Tailor Management System</p> */}
</SidebarFooter>
</Sidebar>
  )
}

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
   

    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
    
        <div className="flex flex-1 flex-col">
          {/* Mobile trigger */}
          <header className="relative flex h-12 items-center border-b bg-white px-4 md:hidden">
  <SidebarTrigger />

  <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
    <Image
      src="/paradise-tailor-logo-lightbackground.png"
      alt="Paradise Tailor"
      width={28}
      height={28}
      className="h-7 w-7 object-contain"
      priority
    />

    <p className="text-sm font-semibold text-slate-800">
      Paradise Tailor
    </p>
  </div>
</header>
    
          <main className="flex-1 bg-gray-50 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AppSidebar