"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ReceiptPreviewDialogProps {
  open: boolean
  html: string
  onCancel: () => void
  onConfirm: () => void
}

// Fallback size shown for the brief moment before the iframe's own content
// has loaded and reported its real dimensions (see handleLoad below) --
// roughly matches the receipt's 80mm width so there's no visible jump on
// the common case.
const FALLBACK_SIZE = { width: 302, height: 420 }

// Rough space the dialog's own chrome around the preview box takes up
// (header text, footer buttons, padding/gaps, the portal's own edge
// margin) -- subtracted from the viewport to get how much room is actually
// left for the receipt itself. Deliberately generous (real browser chrome,
// font rendering, and text wrapping all vary in ways this estimate can't
// account for exactly) -- SAFETY_MARGIN below shrinks the result a further
// 15% on top of that, so the preview never sits flush against the fit
// calculation's exact edge. Between the two, a slightly-too-small estimate
// here still can't produce an overflow.
const DIALOG_CHROME_HEIGHT = 320
const DIALOG_CHROME_WIDTH = 140
const SAFETY_MARGIN = 0.85

// Shown when "Print Receipt" is clicked, before anything actually prints --
// the iframe renders the *exact* HTML string that printReceiptHtml (see
// lib/utils/receipt) will hand to the thermal printer, so what the tailor
// approves here is pixel-identical to what comes out on paper, not just a
// similar-looking mockup. Confirming closes this dialog and opens the
// browser's print dialog for the receipt; cancelling discards it with
// nothing printed.
//
// The receipt is scaled down (CSS transform, never scaled up past 1) to
// whatever fits the viewport, rather than being shown at fixed size with a
// scrollbar for the overflow -- same "fit the whole thing to the screen,
// never scroll" idea the main order board itself uses (see
// BOARD_WIDTH/BOARD_HEIGHT in shalwar-kameez-form.tsx), just scoped to this
// dialog. The iframe still renders its content at full natural size
// internally (so the receipt's own layout never has to reflow into a
// squeezed container) and is only shrunk visually; a wrapper sized to the
// *scaled* dimensions keeps the dialog itself sized to match what's
// actually visible, not the full unscaled iframe.
export function ReceiptPreviewDialog({ open, html, onCancel, onConfirm }: ReceiptPreviewDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [naturalSize, setNaturalSize] = useState(FALLBACK_SIZE)
  const [scale, setScale] = useState(1)

  // A stale size/scale from the last receipt shouldn't flash before this
  // one's `load` event reports its own -- reset whenever the content being
  // previewed changes.
  useEffect(() => {
    setNaturalSize(FALLBACK_SIZE)
    setScale(1)
  }, [html])

  useEffect(() => {
    if (!open) return
    function fit() {
      const availableHeight = window.innerHeight - DIALOG_CHROME_HEIGHT
      const availableWidth = window.innerWidth - DIALOG_CHROME_WIDTH
      const next = Math.min(1, availableHeight / naturalSize.height, availableWidth / naturalSize.width) * SAFETY_MARGIN
      setScale(Number.isFinite(next) && next > 0 ? next : SAFETY_MARGIN)
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [open, naturalSize])

  function handleLoad() {
    const doc = iframeRef.current?.contentDocument
    if (!doc) return
    // +1px on each axis absorbs sub-pixel rounding between the measurement
    // and the next layout pass, which would otherwise show as a 1px
    // scrollbar sliver inside the iframe despite the size already matching.
    setNaturalSize({ width: doc.documentElement.scrollWidth + 1, height: doc.documentElement.scrollHeight + 1 })
  }

  const scaledWidth = naturalSize.width * scale
  const scaledHeight = naturalSize.height * scale

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className="w-full max-w-sm gap-3 rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[14px] font-bold text-black">Print receipt?</AlertDialogTitle>
          <AlertDialogDescription className="text-[12px] text-[#8a8a92]">
            This is exactly what will print. Confirm to send it to the printer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex justify-center rounded-[6px] border border-[#dcdce1] bg-[#f4f4f6] p-3">
          <div style={{ width: scaledWidth, height: scaledHeight }}>
            <iframe
              ref={iframeRef}
              title="Receipt preview"
              srcDoc={html}
              onLoad={handleLoad}
              style={{
                width: 310,
                height: 500,
                border: "1px solid #dcdce1",
                background: "white",
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <Button type="button" variant="outline" className="h-9" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" className="h-9" onClick={onConfirm}>
            Confirm &amp; Print
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
