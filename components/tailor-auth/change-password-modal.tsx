"use client"

import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useChangePassword } from "@/hooks/tailor-auth/use-change-password"

interface ChangePasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  username: string
  onUsernameChange: (value: string) => void
}

export function ChangePasswordModal({ open, onOpenChange, username, onUsernameChange }: ChangePasswordModalProps) {
  const {
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    error, success, loading, submit, reset,
  } = useChangePassword({ username })

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await submit()
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Change Password</AlertDialogTitle>
          <AlertDialogDescription>
            Enter your current password and choose a new one.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => onUsernameChange(e.target.value)} placeholder="username" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label>Old Password</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Re-enter New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-emerald-600">Password updated successfully.</p>}

          <AlertDialogFooter className="mt-1 gap-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="h-10">
              Close
            </Button>
            <Button type="submit" disabled={loading} className="h-10">
              {loading ? <><Loader2 className="mr-2 size-4 animate-spin" />Updating...</> : "Update Password"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
