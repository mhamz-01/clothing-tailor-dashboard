import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { en: "Shalwar Kameez", ur: "شلوار قمیض", href: "/tailor/orders/shalwar-kameez" },
  { en: "Waistcoat", ur: "واسکٹ", href: null },
  { en: "Pant", ur: "پینٹ", href: null },
  { en: "Shirt", ur: "شرٹ", href: null },
  { en: "Coat", ur: "کوٹ", href: null },
]

export default function TailorCategoriesPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-10">
      <Link
        href="/tailor/settings"
        aria-label="Pricing settings"
        className="fixed top-4 right-28 z-10 flex size-8 items-center justify-center rounded-full border bg-white text-slate-500 shadow-sm hover:text-slate-900"
      >
        <Settings className="size-4" />
      </Link>

      <div className="relative mb-4 h-24 w-24">
        <Image
          src="/paradise-tailor-logo-lightbackground.png"
          alt="Paradise Tailor"
          fill
          className="object-contain"
          priority
        />
      </div>

      <h1 className="text-center text-2xl font-bold text-slate-900">
        Categories
        <span className="mt-1 block font-[family-name:var(--font-urdu)] text-xl font-normal text-slate-600">اقسام</span>
      </h1>

      <div className="mt-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => {
          const isEnabled = Boolean(category.href)

          const cardClassName = cn(
            "group relative flex flex-col items-center justify-center gap-3 rounded-2xl border bg-white p-6 text-center shadow-sm transition-all",
            isEnabled
              ? "border-slate-200 hover:-translate-y-0.5 hover:border-slate-900 hover:shadow-md"
              : "cursor-not-allowed border-slate-100 opacity-60"
          )

          const content = (
            <>
              {!isEnabled && (
                <span className="absolute top-3 right-3 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                  Soon
                </span>
              )}
              <div>
                <p className="font-[family-name:var(--font-urdu)] text-xl leading-relaxed text-slate-900">{category.ur}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">{category.en}</p>
              </div>
              {isEnabled && (
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-slate-900">
                  Open
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </>
          )

          return category.href ? (
            <Link key={category.en} href={category.href} className={cardClassName}>
              {content}
            </Link>
          ) : (
            <div key={category.en} className={cardClassName} aria-disabled="true">
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
