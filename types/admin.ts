export type AdminCredential = {
  id: string
  username: string
  password: string
  is_active: boolean
  is_superadmin: boolean
  created_at: string
  expires_at: string
  session_expires_at: string | null
}
