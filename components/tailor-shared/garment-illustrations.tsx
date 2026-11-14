import type { ReactNode } from "react"

// Line illustrations for the categories page: one per garment, drawn on the
// same 120x120 grid with the same stroke, so they read as a matching set.
// Decorative only (aria-hidden): the card's own text names the garment.

export type GarmentIllustrationKey = "shalwar-kameez" | "waistcoat" | "pant" | "shirt" | "coat"

const STROKE = "#1F2A44"
const FILL = "#E6EBF5"
const FILL_ALT = "#CBD5EA"

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      focusable="false"
      className="h-full w-auto overflow-visible"
      fill="none"
      stroke={STROKE}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function Button({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r="1.8" fill={STROKE} stroke="none" />
}

const ILLUSTRATIONS: Record<GarmentIllustrationKey, ReactNode> = {
  // Long kameez (shirt collar, button placket, daman with trim line and side
  // slits) over wide pleated shalwar that narrows to an ankle cuff.
  "shalwar-kameez": (
    <Frame>
      <path d="M32 82 L36 116 H56 L60 94 L64 116 H84 L88 82 Z" fill={FILL_ALT} />
      <path d="M60 94 V82" />
      <path d="M44 88 L45 108 M51 88 L51 108 M76 88 L75 108 M69 88 L69 108" strokeWidth="1.4" />
      <path d="M36.6 110 H56 M64 110 H83.4" />
      <path d="M47 6 L31 12 L13 62 L26 68 L35 40 L29 86 Q60 93 91 86 L85 40 L94 68 L107 62 L89 12 L73 6 Q60 14 47 6 Z" fill={FILL} />
      <path d="M29 86 L31 68 M91 86 L89 68" />
      <path d="M30 81 Q60 88 90 81" />
      <path d="M47 6 L38 15 L52 27 L60 19 L68 27 L82 15 L73 6 Q60 14 47 6 Z" fill={FILL_ALT} />
      <path d="M60 19 V56" />
      <Button cx={60} cy={32} />
      <Button cx={60} cy={41} />
      <Button cx={60} cy={50} />
      <path d="M16 54 L28 60 M92 60 L104 54" />
    </Frame>
  ),
  // Sleeveless, V-neck waistcoat with a button front and two pockets.
  waistcoat: (
    <Frame>
      <path d="M38 12 L27 32 L30 108 H90 L93 32 L82 12 L72 12 L60 40 L48 12 Z" fill={FILL} />
      <path d="M60 40 V108" />
      <Button cx={60} cy={54} />
      <Button cx={60} cy={68} />
      <Button cx={60} cy={82} />
      <Button cx={60} cy={96} />
      <path d="M36 74 H50 M70 74 H84" />
      <path d="M30 108 L60 112 L90 108" />
    </Frame>
  ),
  // Trousers with waistband, belt loops and fly.
  pant: (
    <Frame>
      <path d="M32 12 H88 V24 L94 112 H64 L60 52 L56 112 H26 L32 24 Z" fill={FILL} />
      <path d="M32 24 H88" />
      <path d="M60 24 V52" />
      <path d="M42 12 V24 M78 12 V24" />
      <path d="M36 34 Q44 40 46 50 M84 34 Q76 40 74 50" />
      <Button cx={60} cy={18} />
    </Frame>
  ),
  // Collared shirt with a button placket and long sleeves.
  shirt: (
    <Frame>
      <path d="M42 14 L22 24 L8 70 L26 76 L34 54 V108 H86 V54 L94 76 L112 70 L98 24 L78 14 Q60 26 42 14 Z" fill={FILL} />
      <path d="M42 14 L52 32 L60 24 L68 32 L78 14" fill={FILL_ALT} />
      <path d="M60 24 V108" />
      <Button cx={60} cy={44} />
      <Button cx={60} cy={60} />
      <Button cx={60} cy={76} />
      <Button cx={60} cy={92} />
      <path d="M68 52 H80 V64 H68" />
    </Frame>
  ),
  // Tailored jacket: notch lapels over a shirt, two buttons, flap pockets,
  // chest pocket and cuffed sleeves.
  coat: (
    <Frame>
      <path d="M42 8 Q60 12 78 8 L98 16 L110 82 L95 84 L91 44 L92 110 H28 L29 44 L25 84 L10 82 L22 16 Z" fill={FILL} />
      <path d="M47 9 L60 66 L73 9 Q60 14 47 9 Z" fill="#FFFFFF" />
      <path d="M42 8 L52 24 L40 32 L58 62 L60 70 L47 9 Z" fill={FILL_ALT} />
      <path d="M78 8 L68 24 L80 32 L62 62 L60 70 L73 9 Z" fill={FILL_ALT} />
      <path d="M60 70 V110" />
      <Button cx={60} cy={80} />
      <Button cx={60} cy={94} />
      <path d="M34 88 H50 M70 88 H86" />
      <path d="M70 42 H83" />
      <path d="M12 74 L26 76 M94 76 L108 74" />
      <path d="M29 44 V80 M91 44 V80" />
    </Frame>
  ),
}

export function GarmentIllustration({ garment }: { garment: GarmentIllustrationKey }) {
  return <>{ILLUSTRATIONS[garment]}</>
}
