"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChangePasswordModal } from "@/components/tailor-auth/change-password-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function TailorLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/tailor-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const errorData = await res.json()
      setError(errorData.error || "Invalid username or password.")
      return
    }

    router.push("/tailor/categories")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-3 h-20 w-20">
            <Image
              src="/paradise-tailor-logo-lightbackground.png"
              alt="Paradise Tailor"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Paradise Tailor</h1>
          <p className="mt-1 text-sm text-slate-400">
            Sign in to continue &middot; <span className="font-[family-name:var(--font-urdu)]">جاری رکھنے کے لیے لاگ ان کریں</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-10" />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="h-10 w-full">
            {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Signing in...</> : "Sign In"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setIsChangePasswordOpen(true)}
          className="mt-4 w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          Change Password
        </button>
      </div>

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        username={username}
        onUsernameChange={setUsername}
      />
    </div>
  )
}
