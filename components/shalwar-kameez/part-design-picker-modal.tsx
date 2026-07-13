"use client"

import { Check } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { PART_DESIGN_IMAGES, PART_DESIGN_SIZE1_OPTIONS, PART_DESIGN_SIZE2_OPTIONS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { PartDesignRowState } from "@/types/shalwar-kameez"

const IMAGE_COLUMNS = 4

interface PartDesignPickerModalProps {
  open: boolean
  row: PartDesignRowState | null
  onOpenChange: (open: boolean) => void
  onApply: (designNo: string, size1: string, size2: string) => void
}

// Opened from the Urdu label button on each part-design row (bazu / kuf /
// button patti / jaib). Images are laid out left-to-right, wrapping at
// IMAGE_COLUMNS per row; the 5th grid column holds the two size scroll-lists,
// stacked and equally split across the full height of the image grid.
export function PartDesignPickerModal({ open, row, onOpenChange, onApply }: PartDesignPickerModalProps) {
  const [designNo, setDesignNo] = useState("")
  const [size1, setSize1] = useState("")
  const [size2, setSize2] = useState("")

  useEffect(() => {
    if (open && row) {
      setDesignNo(row.designNo)
      setSize1(row.size1)
      setSize2(row.size2)
    }
  }, [open, row])

  if (!row) return null

  const images = PART_DESIGN_IMAGES[row.key]
  const rowCount = Math.ceil(images.length / IMAGE_COLUMNS)

  function handleSave() {
    onApply(designNo, size1, size2)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-[920px] gap-3 rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-[14px] font-bold text-black">
            <span className="font-[family-name:var(--font-naskh)] text-[20px]" dir="rtl">
              {row.ur}
            </span>
            {row.label} Design
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${IMAGE_COLUMNS}, 1fr) 170px`, gridAutoRows: "150px" }}
        >
          {images.map((image, i) => {
            const selected = designNo === image.value
            return (
              <button
                key={image.value}
                type="button"
                onClick={() => setDesignNo(image.value)}
                style={{ gridColumn: (i % IMAGE_COLUMNS) + 1, gridRow: Math.floor(i / IMAGE_COLUMNS) + 1 }}
                className={cn(
                  "relative overflow-hidden rounded-[6px] border-2 bg-[#fafafb] p-2",
                  selected ? "border-black" : "border-[#dcdce1] hover:border-[#b5b5bd]"
                )}
              >
                {/* object-contain (not cover) — these are line-art references, cropping would cut off part of the design */}
                <Image src={image.src} alt={`${row.label} ${image.value}`} fill sizes="200px" className="object-contain" />
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

          <div className="flex flex-col gap-2" style={{ gridColumn: IMAGE_COLUMNS + 1, gridRow: `1 / span ${rowCount}` }}>
            <SizeOptionList label="Size 1" options={PART_DESIGN_SIZE1_OPTIONS} value={size1} onChange={setSize1} />
            <SizeOptionList label="Size 2" options={PART_DESIGN_SIZE2_OPTIONS} value={size2} onChange={setSize2} />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <Button type="button" variant="outline" className="h-9" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="h-9" onClick={handleSave}>
            Save
          </Button>
        </AlertDialogFooter>
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

// Deliberately not a <select>/dropdown — a bordered, scrollable list of always-
// visible option buttons, per spec.
function SizeOptionList({ label, options, value, onChange }: SizeOptionListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[5px] border border-[#dcdce1] bg-white">
      <div className="shrink-0 border-b border-[#dcdce1] bg-[#fafafb] px-2 py-1 text-center text-[10px] font-bold tracking-[0.05em] text-[#8a8a92] uppercase">
        {label}
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "block w-full rounded-[3px] px-2 py-[3px] text-center text-[11px] font-semibold whitespace-nowrap",
              value === option ? "bg-black text-white" : "text-[#222226] hover:bg-[#f0f0f2]"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
