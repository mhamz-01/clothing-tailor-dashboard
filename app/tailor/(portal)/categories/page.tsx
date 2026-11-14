import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { en: "Shalwar Kameez", ur: "شلوار قمیض", href: "/tailor/orders/shalwar-kameez" },
  { en: "Waistcoat", ur: "واسکٹ", href: "/tailor/orders/waistcoat" },
  { en: "Pant", ur: "پینٹ", href: "/tailor/orders/pant" },
  { en: "Shirt", ur: "شرٹ", href: "/tailor/orders/shirt" },
  { en: "Coat", ur: "کوٹ", href: "/tailor/orders/coat" },
]

const delay = (index: number) => ({ "--anim-delay": `${260 + index * 90}ms` }) as CSSProperties

export default function TailorCategoriesPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,#2A3A5E_0%,#1F2A44_45%,#141C30_100%)]">
      <header className="relative shrink-0 px-4 pt-[clamp(1rem,3vh,2rem)] pb-[clamp(1rem,3vh,2rem)] text-center">
        <Link
          href="/tailor/settings"
          aria-label="Pricing settings"
          className="fixed top-4 right-28 z-10 flex size-8 items-center justify-center rounded-full border border-[#DDD8CC] bg-white text-[#5B6377] shadow-sm hover:border-[#B08D57] hover:text-[#1F2A44]"
        >
          <Settings className="size-4" />
        </Link>

        <div className="anim-fade-in relative mx-auto mb-[clamp(0.5rem,1.5vh,1rem)] h-[clamp(4rem,11vh,6.5rem)] w-[clamp(4rem,11vh,6.5rem)]">
          <Image
            src="/paradise-tailor-logo-darkbackground.png"
            alt="Paradise Tailor"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="anim-fade-down text-[clamp(1.5rem,4vh,2rem)] leading-tight font-bold tracking-tight text-white">Categories</h1>
        <p style={{ "--anim-delay": "80ms" } as CSSProperties} className="anim-fade-down font-[family-name:var(--font-urdu)] text-[clamp(1rem,2.6vh,1.35rem)] leading-loose text-[#E3C894]">اقسام</p>
        <div style={{ "--anim-delay": "160ms" } as CSSProperties} className="anim-fade-in mx-auto mt-1 h-[3px] w-12 rounded-full bg-[#B08D57]" />
        <p style={{ "--anim-delay": "200ms" } as CSSProperties} className="anim-fade-in mt-[clamp(0.4rem,1.2vh,0.9rem)] text-sm text-[#B9C0D0]">Choose a garment to start a new order</p>
      </header>

      {/* The grid fills whatever height is left, so the page never scrolls:
          two equal rows (3 cards over 2), each card stretching to its row. */}
      <main className="relative z-0 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-[clamp(0.75rem,2.5vh,1.5rem)]">
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[repeat(3,minmax(0,1fr))] gap-[clamp(0.6rem,1.8vh,1.1rem)] sm:grid-cols-6 sm:grid-rows-2">
          {CATEGORIES.map((category, index) => {
            const isEnabled = Boolean(category.href)

            const cardClassName = cn(
              "anim-fade-up group relative flex min-h-0 flex-col items-center justify-center gap-[clamp(0.4rem,1.6vh,1rem)] overflow-hidden rounded-2xl border bg-white p-4 text-center shadow-[0_2px_10px_rgba(31,42,68,0.08)] transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-[#B08D57]/40 focus-visible:outline-none",
              "sm:col-span-2",
              index >= 3 && "sm:col-span-3",
              isEnabled
                ? "border-[#DDD8CC] hover:-translate-y-0.5 hover:border-[#B08D57] hover:shadow-[0_10px_24px_rgba(31,42,68,0.16)]"
                : "cursor-not-allowed border-[#E9E4D8] opacity-60"
            )

            const content = (
              <>
                <span className="absolute inset-x-0 top-0 h-[3px] bg-[#B08D57] opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute top-3 left-4 text-[11px] font-semibold tracking-widest text-[#B08D57]/70 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {!isEnabled && (
                  <span className="absolute top-3 right-3 rounded-full bg-[#F1EEE6] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6B7285] uppercase">
                    Soon
                  </span>
                )}
                <div className="flex flex-col items-center gap-0.5">
                  <p className="font-[family-name:var(--font-urdu)] text-[clamp(1.5rem,4.2vh,2.4rem)] leading-loose text-[#1F2A44]">
                    {category.ur}
                  </p>
                  <p className="text-[clamp(0.8rem,1.8vh,1rem)] font-semibold tracking-[0.12em] text-[#5B6377] uppercase">
                    {category.en}
                  </p>
                </div>
                {isEnabled && (
                  <span className="flex items-center gap-1.5 rounded-full border border-[#DDD8CC] px-4 py-1.5 text-xs font-semibold text-[#7C5E28] transition-colors group-hover:border-[#1F2A44] group-hover:bg-[#1F2A44] group-hover:text-white">
                    Open
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </>
            )

            return category.href ? (
              <Link key={category.en} href={category.href} className={cardClassName} style={delay(index)}>
                {content}
              </Link>
            ) : (
              <div key={category.en} className={cardClassName} aria-disabled="true" style={delay(index)}>
                {content}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
