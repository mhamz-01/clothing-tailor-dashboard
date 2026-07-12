import type { ReactNode } from "react"
import { Noto_Nastaliq_Urdu } from "next/font/google"

// Scoped to app/tailor/** only, deliberately separate from the fonts loaded
// by the root layout for the admin dashboard.
const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "700"],
})

export default function TailorModuleLayout({ children }: { children: ReactNode }) {
  return <div className={`${notoNastaliqUrdu.variable} min-h-screen`}>{children}</div>
}
