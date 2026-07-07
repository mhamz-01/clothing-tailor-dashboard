"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, ShieldCheck, UserX, UserCheck, RefreshCw } from "lucide-react"
import Image from "next/image"
import {
  useSuperAdminSession,
  useSuperAdminLogin,
  useSuperAdminAdmins,
  useAddAdmin,
  useToggleAdminActive,
  useRenewAdminMembership,
} from "@/hooks/superadmin/use-superadmin-admins"
import { formatDate, formatTimeRemaining } from "@/lib/utils/date"

export default function SuperAdminPage() {
  const { data: isAuthenticated, isLoading: isCheckingSession } = useSuperAdminSession()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [superUsername, setSuperUsername] = useState("")
  const [superPassword, setSuperPassword] = useState("")

  const login = useSuperAdminLogin()
  const { data: admins = [], isLoading: isLoadingAdmins } = useSuperAdminAdmins(!!isAuthenticated)
  const addAdmin = useAddAdmin()
  const toggleActive = useToggleAdminActive()
  const renewMembership = useRenewAdminMembership()

  function handleSuperAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    login.mutate({ username: superUsername, password: superPassword })
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) < new Date()
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    )
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
              {login.isError && <p className="text-xs text-red-500">{login.error.message}</p>}
            </div>
            <Button type="submit" disabled={login.isPending} className="h-10 w-full">
              {login.isPending ? <Loader2 className="size-4 animate-spin" /> : "Enter"}
            </Button>
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
          <Button
            onClick={() =>
              addAdmin.mutate(
                { username, password },
                { onSuccess: () => { setUsername(""); setPassword("") } }
              )
            }
            disabled={addAdmin.isPending || !username || !password}
            className="h-10"
          >
            {addAdmin.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" />Adding...</> : "Add User"}
          </Button>
        </div>

        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Existing Users</h2>
          </div>
          {isLoadingAdmins ? (
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
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Session</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => {
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
                        <td className="px-4 py-3 text-xs font-medium text-slate-500">
                          {formatTimeRemaining(admin.session_expires_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm" variant="outline" className="h-7 px-2 text-xs"
                              onClick={() => renewMembership.mutate(admin.id)}
                            >
                              <RefreshCw className="mr-1 size-3" />Renew
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              className={`h-7 px-2 text-xs ${admin.is_active ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"}`}
                              onClick={() => toggleActive.mutate({ id: admin.id, isActive: !admin.is_active })}
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
