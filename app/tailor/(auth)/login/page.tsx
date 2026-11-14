"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChangePasswordModal } from "@/components/tailor-auth/change-password-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react"
import Image from "next/image"

export default function TailorLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="grid min-h-dvh grid-cols-1 bg-[#F6F4EF] lg:grid-cols-2">
      {/* Brand half */}
      <aside className="relative hidden overflow-hidden bg-[radial-gradient(ellipse_at_top_left,#2A3A5E_0%,#1F2A44_50%,#141C30_100%)] lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full border border-[#B08D57]/25" />
        <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full border border-[#B08D57]/20" />
        <div className="pointer-events-none absolute right-12 bottom-12 size-40 rounded-full border border-[#B08D57]/15" />

        <div className="anim-fade-up relative flex max-w-md flex-col items-center text-center">
          <div className="relative mb-8 size-40">
            <Image src="/paradise-tailor-logo-darkbackground.png" alt="Paradise Tailor" fill className="object-contain" priority />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white">Paradise Tailor</h2>
          <p className="mt-2 font-[family-name:var(--font-urdu)] text-2xl leading-loose text-[#E3C894]">پیراڈائز ٹیلر</p>
          <div className="my-6 h-[3px] w-14 rounded-full bg-[#B08D57]" />
          <p className="text-base leading-relaxed text-[#B9C0D0]">
            Measurements, orders and receipts for every garment, all in one place.
          </p>
        </div>
      </aside>

      {/* Form half */}
      <main className="flex items-center justify-center px-6 py-10">
        <div className="anim-fade-up w-full max-w-sm" style={{ "--anim-delay": "120ms" } as React.CSSProperties}>
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative mb-4 size-20 lg:hidden">
              <Image src="/paradise-tailor-logo-lightbackground.png" alt="Paradise Tailor" fill className="object-contain" priority />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1F2A44]">Welcome back</h1>
            <p className="mt-1.5 text-sm text-[#6B7285]">
              Sign in to continue &middot;{" "}
              <span className="font-[family-name:var(--font-urdu)]">جاری رکھنے کے لیے لاگ ان کریں</span>
            </p>
            <div className="mt-4 h-[3px] w-10 rounded-full bg-[#B08D57]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-semibold tracking-wide text-[#5B6377] uppercase">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9AA0B0]" />
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="h-11 border-[#DDD8CC] bg-white pl-9 focus-visible:border-[#B08D57] focus-visible:ring-[#B08D57]/30"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold tracking-wide text-[#5B6377] uppercase">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9AA0B0]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-[#DDD8CC] bg-white pr-10 pl-9 focus-visible:border-[#B08D57] focus-visible:ring-[#B08D57]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded text-[#9AA0B0] hover:text-[#1F2A44]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="h-11 w-full bg-[#1F2A44] text-sm font-semibold text-white hover:bg-[#2A3A5E]">
              {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Signing in...</> : "Sign In"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="mt-5 w-full text-center text-xs font-medium text-[#7C5E28] hover:text-[#1F2A44] lg:text-left"
          >
            Change Password
          </button>
        </div>
      </main>

      <ChangePasswordModal
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        username={username}
        onUsernameChange={setUsername}
      />
    </div>
  )
}
