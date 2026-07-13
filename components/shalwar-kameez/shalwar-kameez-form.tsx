"use client"

import { Noto_Naskh_Arabic } from "next/font/google"
import { useEffect, useRef } from "react"
import { ActionBar } from "@/components/shalwar-kameez/action-bar"
import { ClientLookupSection } from "@/components/shalwar-kameez/client-lookup-section"
import { MeasurementsPanel } from "@/components/shalwar-kameez/measurements-panel"
import { OrderSummaryPanel } from "@/components/shalwar-kameez/order-summary-panel"
import { PartDesignTable } from "@/components/shalwar-kameez/part-design-table"
import { StyleOptionsPanel } from "@/components/shalwar-kameez/style-options-panel"
import { useShalwarKameezForm } from "@/hooks/shalwar-kameez/use-shalwar-kameez-form"

const BOARD_WIDTH = 1360
const BOARD_HEIGHT = 764

// The design spec calls for Noto Naskh Arabic specifically (not the
// Noto Nastaliq Urdu used by the rest of the tailor module) — scoped to
// this board only via its own CSS variable so it doesn't affect other pages.
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
})

// Order-entry form for the Shalwar Kameez category, rebuilt to match the
// Claude Design spec (project "Shalwar Kameez Measurement Dashboard",
// file "Shalwar Kameez Dashboard.dc.html") pixel-for-pixel: a fixed
// 1360x764 board, uniformly scaled to fit the viewport (never reflows,
// never overflows — small screens just see a smaller board, same
// proportions) on a full-viewport #dcdce1 backdrop. All state lives in
// use-shalwar-kameez-form; this component only lays the panels out.
export function ShalwarKameezForm() {
  const form = useShalwarKameezForm()
  const { state } = form
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fit() {
      const el = boardRef.current
      if (!el) return
      const scale = Math.min(window.innerWidth / BOARD_WIDTH, window.innerHeight / BOARD_HEIGHT, 1.15)
      el.style.transform = `scale(${scale})`
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#dcdce1]">
      <div
        ref={boardRef}
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
        className={`flex flex-none origin-center flex-col overflow-hidden bg-white shadow-[0_6px_34px_rgba(0,0,0,0.16)] ${notoNaskhArabic.variable}`}
      >
        {/* Title bar */}
        <div className="flex h-8 flex-none items-center gap-2.5 bg-black px-3 text-white">
          <span className="font-[family-name:var(--font-naskh)] text-[14px] font-bold" dir="rtl">
            شلوار قمیض
          </span>
          <span className="h-3.5 w-px bg-[#4a4a52]" />
          <span className="text-[12px] font-bold tracking-[0.06em] text-[#c9c9d1] uppercase">Measurement &amp; Order Sheet</span>
          <span className="ml-auto text-[12px] font-bold text-[#9a9aa4]">
            Record No. <b className="tabular-nums text-white">{state.recordNo || "—"}</b>
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
          <ClientLookupSection
            clientNo={state.clientNo}
            bookDate={state.bookDate}
            recordNo={state.recordNo}
            pBal={state.pBal}
            clientName={state.clientName}
            phoneNo={state.phoneNo}
            onClientNoChange={(value) => form.updateField("clientNo", value)}
            onBookDateChange={(value) => form.updateField("bookDate", value)}
            onRecordNoChange={(value) => form.updateField("recordNo", value)}
            onPBalChange={(value) => form.updateField("pBal", value)}
            onClientNameChange={(value) => form.updateField("clientName", value)}
            onPhoneNoChange={(value) => form.updateField("phoneNo", value)}
            onSearchRecord={() => form.updateField("statusMsg", "Searching by record no…")}
            onSearchClientName={() => form.updateField("statusMsg", "Searching by client name…")}
            onSearchPhone={() => form.updateField("statusMsg", "Searching by phone no…")}
            largeButtonsItem={form.largeButtonsItem}
            lookupCheckItems={form.lookupCheckItems}
          />

          <div className="grid min-h-0 flex-1 grid-cols-[228px_1fr_420px] gap-2">
            <MeasurementsPanel
              rows={form.measurementRows}
              note={state.note}
              onNoteChange={(value) => form.updateField("note", value)}
              extraNo1={state.extraNo1}
              onExtraNo1Change={(value) => form.updateField("extraNo1", value)}
              extraNo2={state.extraNo2}
              onExtraNo2Change={(value) => form.updateField("extraNo2", value)}
            />

            <StyleOptionsPanel
              styleFlagItems={form.styleFlagItems}
              pocketOptions={form.pocketOptions}
              bainOptions={form.bainOptions}
              collarOptions={form.collarOptions}
              damanOptions={form.damanOptions}
              bainStyleNo={state.bainStyleNo}
              onBainStyleNoChange={(value) => form.updateField("bainStyleNo", value)}
              collarStyleNo={state.collarStyleNo}
              onCollarStyleNoChange={(value) => form.updateField("collarStyleNo", value)}
              shalwarZipItem={form.shalwarZipItem}
            />

            <div className="flex min-h-0 flex-col gap-2">
              <PartDesignTable rows={state.partDesigns} onSizeChange={form.updatePartDesign} onLabelClick={(row) => form.updateField("statusMsg", `${row.label} selected`)} />
              <OrderSummaryPanel
                order={state.order}
                onOrderFieldChange={form.updateOrderField}
                total={form.total}
                balance={form.balance}
                buttonOptions={form.buttonOptions}
              />
            </div>
          </div>

          <ActionBar
            statusMsg={state.statusMsg}
            onPrintReceipt={form.handlePrintReceipt}
            onSave={form.handleSave}
            onClear={form.clearForm}
            onPrev={form.handlePrev}
            onNext={form.handleNext}
            onPrint={form.handlePrint}
            onDelete={form.handleDelete}
            onExit={form.handleExit}
          />
        </div>
      </div>
    </div>
  )
}
