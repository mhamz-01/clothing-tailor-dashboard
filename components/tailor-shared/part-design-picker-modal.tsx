"use client"

import { Check, X } from "lucide-react"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PART_DESIGN_IMAGES, PART_DESIGN_SIZE_CONFIG } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import { formatSizeLabel } from "@/lib/utils/format-size"
import type { CheckboxItem, PartDesignKey, PartDesignRowState } from "@/types/shalwar-kameez"

const DEFAULT_IMAGE_COLUMNS = 4
const DEFAULT_IMAGE_ROW_HEIGHT = 130
// Kuf/Bazu/Button Patti each have too few source images to fill a 4-column
// row more than twice over -- at the default column count they'd leave the
// image area looking sparse/empty next to the much taller size lists beside
// it, and each thumbnail would render small. Fewer columns means fewer,
// bigger images per row and more rows overall, closing that gap.
const IMAGE_COLUMNS_BY_PART: Partial<Record<PartDesignKey, number>> = {
  kuf: 2,
  bazu: 2,
  buttonPatti: 3,
}

// Paired with the narrower column counts above -- a taller row keeps each
// bigger, wider thumbnail from looking squashed, and helps the image grid's
// total height track the size lists' fixed h-64 instead of falling well
// short of it.
const IMAGE_ROW_HEIGHT_BY_PART: Partial<Record<PartDesignKey, number>> = {
  bazu: 170,
  buttonPatti: 170,
}

interface PartDesignPickerModalProps {
  open: boolean
  row: PartDesignRowState | null
  onOpenChange: (open: boolean) => void
  onChange: (field: "designNo" | "size1" | "size2", value: string) => void
  fiveButtonsItem: CheckboxItem
}

// Opened from the Urdu label button on each part-design row (bazu / kuf /
// button patti / jaib). Images are laid out left-to-right, wrapping at
// IMAGE_COLUMNS per row, in a flex row alongside the two size scroll-lists --
// each list is a fixed height (see SizeOptionList) rather than stretched to
// match the image grid, so a short image grid (e.g. bazu/kuf's 2 rows) won't
// squeeze the size lists down below a usable row count.
//
// Every pick is written straight through `onChange` into the form's own
// state -- there is no local draft and no Save/Cancel step, so closing the
// dialog by any route (the X, Esc, the backdrop) keeps whatever was picked.
export function PartDesignPickerModal({ open, row, onOpenChange, onChange, fiveButtonsItem }: PartDesignPickerModalProps) {
  if (!row) return null

  const { designNo, size1, size2 } = row

  const images = PART_DESIGN_IMAGES[row.key]
  const imageColumns = IMAGE_COLUMNS_BY_PART[row.key] ?? DEFAULT_IMAGE_COLUMNS
  const imageRowHeight = IMAGE_ROW_HEIGHT_BY_PART[row.key] ?? DEFAULT_IMAGE_ROW_HEIGHT
  const sizeConfig = PART_DESIGN_SIZE_CONFIG[row.key]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="relative max-h-[95vh] w-full max-w-[820px] gap-3 overflow-y-auto rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-[5px] text-[#222226] hover:bg-[#f0f0f2]"
        >
          <X className="size-5" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[14px] font-bold text-black">
            <span className="font-[family-name:var(--font-naskh)] text-[20px]" dir="rtl">
              {row.ur}
            </span>
            {row.label} Design
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex items-start gap-3">
          <div className="grid flex-1 gap-2.5" style={{ gridTemplateColumns: `repeat(${imageColumns}, 1fr)`, gridAutoRows: `${imageRowHeight}px` }}>
            {images.map((image, i) => {
              const selected = designNo === image.value
              return (
                <button
                  key={image.value}
                  type="button"
                  onClick={() => onChange("designNo", image.value)}
                  style={{ gridColumn: (i % imageColumns) + 1, gridRow: Math.floor(i / imageColumns) + 1 }}
                  className={cn(
                    "relative overflow-hidden rounded-[6px] border-2 bg-[#fafafb] p-1.5",
                    selected ? "border-black" : "border-[#dcdce1] hover:border-[#b5b5bd]"
                  )}
                >
                  {/* object-contain (not cover) — these are line-art references, cropping would cut off part of the design */}
                  <Image src={image.src} alt={`${row.label} ${image.value}`} fill sizes="220px" className="object-contain" />
                  <span
                    className={cn(
                      "absolute top-1.5 left-1.5 flex size-5 items-center justify-center rounded-sm border",
                      selected ? "border-black bg-black" : "border-[#c7c7cf] bg-white"
                    )}
                  >
                    {selected && <Check className="size-3.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="absolute right-1.5 bottom-1.5 rounded-[3px] bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">
                    {image.value}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex w-[170px] shrink-0 flex-col gap-2">
            <SizeOptionList label={sizeConfig.size1Label} options={sizeConfig.size1Options} value={size1} onChange={(v) => onChange("size1", v)} />
            <SizeOptionList label={sizeConfig.size2Label} options={sizeConfig.size2Options} value={size2} onChange={(v) => onChange("size2", v)} />
          </div>
        </div>

        {row.key === "buttonPatti" && (
          <AlertDialogFooter className="items-center gap-2">
            <label className="mr-auto flex cursor-pointer items-center gap-1.5 text-[13px] font-semibold text-[#222226]">
              <input
                type="checkbox"
                checked={fiveButtonsItem.checked}
                onChange={fiveButtonsItem.onChange}
                className="size-4 cursor-pointer accent-[#111116]"
              />
              {fiveButtonsItem.label}
            </label>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface SizeOptionListProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

// Deliberately not a <select>/dropdown — a bordered list of always-visible
// option buttons, per spec. Rows are tight and stacked with hairline dividers
// (not spaced-out pills), and the two lists stack in a single column. Each
// list shows every option at full height, with no inner scroll (the modal
// itself only scrolls as a last resort on a very short viewport).
function SizeOptionList({ label, options, value, onChange }: SizeOptionListProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[5px] border border-[#dcdce1] bg-white">
      <div className="shrink-0 border-b border-[#dcdce1] bg-[#fafafb] px-1 py-1 text-center text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">
        {label}
      </div>
      <div className="flex flex-col divide-y divide-[#ececf0]">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "block w-full shrink-0 px-1 py-[1px] text-center text-[14px] leading-[18px] font-semibold whitespace-nowrap",
              value === option ? "bg-black text-white" : "text-[#222226] hover:bg-[#f0f0f2]"
            )}
          >
            {formatSizeLabel(option)}
          </button>
        ))}
      </div>
    </div>
  )
}
