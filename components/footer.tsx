import { Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-black px-6 py-3 font-[family-name:var(--font-poppins)] text-sm text-white">
          <span className="text-slate-400">Developed by</span>
          <span className="text-base font-extrabold tracking-wide">IntellectualHut</span>
          <span className="text-slate-600">·</span>
          <a
            href="tel:03049024972"
            className="inline-flex items-center gap-2 font-bold transition-colors hover:text-indigo-400"
          >
            <Phone className="size-4" />
            0304-9024972
          </a>
        </div>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  )
}
