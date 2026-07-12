"use client"

import { useState } from "react"

interface UseChangePasswordArgs {
  username: string
}

// No react-query here on purpose — the tailor module (app/tailor/**) has no
// QueryClientProvider (that's only set up for the admin dashboard), so this
// follows the same plain fetch + useState pattern as the login page itself.
export function useChangePassword({ username }: UseChangePasswordArgs) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function reset() {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
    setLoading(false)
  }

  async function submit() {
    setError("")
    setSuccess(false)

    if (!username.trim() || !oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/tailor-change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), oldPassword, newPassword }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "Something went wrong.")
      return
    }

    setSuccess(true)
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    loading,
    submit,
    reset,
  }
}
