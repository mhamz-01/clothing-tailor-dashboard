"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, UserX, UserCheck, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

const queryClient = new QueryClient()

// ── All logic lives here, inside the provider ─────────────────────────────────
function SuperAdminContent() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [superUsername, setSuperUsername] = useState("")
  const [superPassword, setSuperPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState("")

  function handleSuperAuth(e: React.FormEvent) {
    e.preventDefault()
    if (
      superUsername === process.env.NEXT_PUBLIC_SUPER_USERNAME &&
      superPassword === process.env.NEXT_PUBLIC_SUPER_PASSWORD
    ) {
      setIsAuthenticated(true)
    } else {
      setAuthError("Wrong credentials.")
    }
  }

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_credentials")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: isAuthenticated,
  })

  const { mutate: addAdmin, isPending: isAdding } = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admin_credentials").insert({
        username: username.trim(),
        password: password.trim(),
        is_active: true,
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      toast({ title: "User added successfully." })
      setUsername(""); setPassword("")
      queryClient.invalidateQueries({ queryKey: ["admins"] })
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  })

  async function toggleActive(id: string, current: boolean) {
    const { error } = await supabase.from("admin_credentials").update({ is_active: !current }).eq("id", id)
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return }
    toast({ title: current ? "User blocked." : "User activated." })
    queryClient.invalidateQueries({ queryKey: ["admins"] })
  }

  async function renewMembership(id: string) {
    const { error } = await supabase.from("admin_credentials").update({
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      is_active: true,
    }).eq("id", id)
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return }
    toast({ title: "Membership renewed for 1 year." })
    queryClient.invalidateQueries({ queryKey: ["admins"] })
  }

  function formatDate(val: string) {
    return new Date(val).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) < new Date()
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
          <div className="flex size-20 items-center justify-center">
  <Image
    src="/paradise-tailor-logo-lightbackground.png"
    alt="Paradise Tailor"
    width={100}
    height={100}
    className="object-contain"
    priority
  />
</div>
            <div>
              <h1 className="text-base font-bold text-slate-900">Paradise Tailor Superadmin</h1>
              <p className="text-xs text-slate-400">Enter your credentials</p>
            </div>
          </div>
          <form onSubmit={handleSuperAuth} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input value={superUsername} onChange={(e) => setSuperUsername(e.target.value)} placeholder="superadmin" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" value={superPassword} onChange={(e) => setSuperPassword(e.target.value)} placeholder="••••••••" className="h-10" />
              {authError && <p className="text-xs text-red-500">{authError}</p>}
            </div>
            <Button type="submit" className="h-10 w-full">Enter</Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900">
            <ShieldCheck className="size-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Superadmin Panel</h1>
            <p className="text-sm text-slate-400">Manage admin users and access</p>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 border-b pb-3">Add New Admin User</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" className="h-10" />
            </div>
          </div>
          <Button onClick={() => addAdmin()} disabled={isAdding || !username || !password} className="h-10">
            {isAdding ? <><Loader2 className="mr-2 size-4 animate-spin" />Adding...</> : "Add User"}
          </Button>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Existing Users</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Password</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Expires</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin: any) => {
                    const expired = isExpired(admin.expires_at)
                    return (
                      <tr key={admin.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{admin.username}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{admin.password}</td>
                        <td className="px-4 py-3">
                          {!admin.is_active ? (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Blocked</span>
                          ) : expired ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">Expired</span>
                          ) : (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">Active</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(admin.created_at)}</td>
                        <td className={`px-4 py-3 text-xs font-medium ${expired ? "text-red-500" : "text-slate-500"}`}>
                          {formatDate(admin.expires_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => renewMembership(admin.id)}>
                              <RefreshCw className="mr-1 size-3" />Renew
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              className={`h-7 px-2 text-xs ${admin.is_active ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"}`}
                              onClick={() => toggleActive(admin.id, admin.is_active)}
                            >
                              {admin.is_active
                                ? <><UserX className="mr-1 size-3" />Block</>
                                : <><UserCheck className="mr-1 size-3" />Activate</>
                              }
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Outer wrapper provides the QueryClient ────────────────────────────────────
export default function SuperAdminPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuperAdminContent />
      <Toaster />
    </QueryClientProvider>
  )
}