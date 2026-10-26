"use client"

import { Noto_Naskh_Arabic } from "next/font/google"
import { useEffect, useRef } from "react"
import { GarmentBillingPanel } from "@/components/garment-order/garment-billing-panel"
import { GarmentMeasurementsPanel } from "@/components/garment-order/garment-measurements-panel"
import { GarmentOptionsPanel } from "@/components/garment-order/garment-options-panel"
import { ActionBar } from "@/components/tailor-shared/action-bar"
import { ClientLookupSection } from "@/components/tailor-shared/client-lookup-section"
import { ClientMatchPickerModal } from "@/components/tailor-shared/client-match-picker-modal"
import { PartDesignTable } from "@/components/tailor-shared/part-design-table"
import { ReceiptPreviewDialog } from "@/components/tailor-shared/receipt-preview-dialog"
import { StatusToast } from "@/components/tailor-shared/status-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGarmentOrderForm } from "@/hooks/garment-order/use-garment-order-form"
import type { GarmentDefinition } from "@/types/garment-form"

// Same fixed-size, scale-to-fit board as the Shalwar Kameez form, so all five
// order sheets look and behave alike.
const BOARD_WIDTH = 1610
const BOARD_HEIGHT = 770

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["600", "500", "700"],
})

const FIVE_BUTTONS_FLAG = "5_btn"

// Order-entry board for one garment of the Waistcoat / Pant / Coat / Shirt
// family. The layout (client strip | measurements | style options | part
// designs + billing | action bar) is shared; what each panel shows comes from
// the GarmentDefinition. All state lives in useGarmentOrderForm.
export function GarmentOrderForm({ definition }: { definition: GarmentDefinition }) {
  const form = useGarmentOrderForm(definition)
  const { state, lookup, status } = form
  const boardRef = useRef<HTMLDivElement>(null)
  const hasPairs = definition.measurements.some((m) => m.secondColumn)

  useEffect(() => {
    function fit() {
      const el = boardRef.current
      if (!el) return
      el.style.transform = `scale(${Math.min(window.innerWidth / BOARD_WIDTH, window.innerHeight / BOARD_HEIGHT)})`
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])

  const buttonOptions = definition.buttonType?.choices.map((choice) => ({
    value: choice.value,
    label: choice.label,
    checked: state.values.options[definition.buttonType!.column] === choice.value,
    onChange: () => form.setOption(definition.buttonType!.column, choice.value),
  }))

  const fiveButtonsItem = {
    key: FIVE_BUTTONS_FLAG,
    label: "5 Buttons",
    checked: state.values.flags.includes(FIVE_BUTTONS_FLAG),
    onChange: () => form.toggleFlag(FIVE_BUTTONS_FLAG),
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center overflow-hidden bg-[#dcdce1]">
      <div
        ref={boardRef}
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
        className={`relative flex flex-none origin-center flex-col overflow-hidden bg-white shadow-[0_6px_34px_rgba(0,0,0,0.16)] ${notoNaskhArabic.variable}`}
      >
        <div className="flex h-8 flex-none items-center gap-2.5 bg-black px-3 text-white">
          <span className="font-[family-name:var(--font-naskh)] text-[14px] font-bold" dir="rtl">
            {definition.titleUr}
          </span>
          <span className="h-3.5 w-px bg-[#4a4a52]" />
          <span className="text-[12px] font-bold tracking-[0.06em] text-[#c9c9d1] uppercase">
            {definition.titleEn} Measurement &amp; Order Sheet
          </span>
          <span className="ml-auto text-[12px] font-bold text-[#9a9aa4]">
            Record No. <b className="tabular-nums text-white">{form.recordNo || "—"}</b>
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 p-2.5">
          <ClientLookupSection
            clientNo={state.clientNo}
            clientNoValidation={lookup.clientNoValidation}
            bookDate={state.bookDate}
            recordNo={form.recordNo}
            pBal={state.pBal}
            clientName={state.clientName}
            phoneNo={state.phoneNo}
            orderType={definition.key}
            onClientNoChange={(value) => form.setField("clientNo", value)}
            onBookDateChange={(value) => form.setField("bookDate", value)}
            onPBalChange={(value) => form.setField("pBal", value)}
            onClientNameChange={(value) => form.setField("clientName", value)}
            onPhoneNoChange={(value) => form.setField("phoneNo", value)}
            onRecordNoChange={form.setRecordNo}
            onSearchRecord={form.handleSearchRecord}
            onSearchClientName={lookup.handleSearchClientName}
            onSearchPhone={lookup.handleSearchPhone}
            onSearchClientNo={lookup.handleSearchClientNo}
            onAddClient={lookup.handleAddClient}
            onSelectExistingClient={lookup.handleSelectExistingClient}
            onClientDeleted={lookup.handleClientDeleted}
          />

          <div className={`grid min-h-0 flex-1 gap-2 ${hasPairs ? "grid-cols-[300px_1fr_420px]" : "grid-cols-[228px_1fr_420px]"}`}>
            <GarmentMeasurementsPanel
              measurements={definition.measurements}
              values={state.values.measurements}
              onChange={form.setMeasurement}
              note={state.values.note}
              onNoteChange={form.setNote}
            />

            <GarmentOptionsPanel
              definition={definition}
              options={state.values.options}
              flags={state.values.flags}
              onOptionChange={form.setOption}
              onToggleFlag={form.toggleFlag}
            />

            <div className="flex min-h-0 flex-col gap-2">
              {definition.hasPartDesigns && (
                <PartDesignTable rows={state.values.parts} onSizeChange={form.updatePart} fiveButtonsItem={fiveButtonsItem} />
              )}
              <GarmentBillingPanel
                order={state.order}
                deliveryDate={form.deliveryDate}
                billing={form.billing}
                placeholders={form.placeholders}
                quantityLabel={definition.quantityLabel}
                showOthersAmt={definition.showOthersAmt}
                buttonOptions={buttonOptions}
                onChange={form.setOrderField}
              />
            </div>
          </div>

          <ActionBar
            onPrintReceipt={form.openReceiptPreview}
            onSave={form.handleSave}
            onClear={() => form.clearForm()}
            onPrev={lookup.handlePrev}
            onNext={lookup.handleNext}
            prevDisabled={!lookup.canGoPrev}
            nextDisabled={!lookup.canGoNext}
            onPrint={form.handlePrint}
            onDelete={form.handleDelete}
            deleteDisabled={!form.canDelete}
            onExit={form.handleExit}
          />
        </div>
      </div>

      {/* Outside the scaled board on purpose: anything nested in it shrinks with
          the transform, and toasts/dialogs must stay legible at native size. */}
      <StatusToast statusMsg={status.statusMsg} statusKind={status.statusKind} onDismiss={status.dismiss} />

      <ReceiptPreviewDialog
        open={form.receiptPreviewOpen}
        html={form.receiptHtml}
        onCancel={form.closeReceiptPreview}
        onConfirm={form.confirmPrintReceipt}
      />

      <ClientMatchPickerModal
        open={lookup.matchPicker !== null}
        matches={lookup.matchPicker?.matches ?? []}
        onOpenChange={(open) => !open && lookup.closeMatchPicker()}
        onSelect={lookup.handleSelectClientMatch}
      />

      <AlertDialog open={lookup.pendingNav !== null} onOpenChange={(open) => !open && lookup.cancelNavigation()}>
        <AlertDialogContent className="w-full max-w-sm gap-3 rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px] font-bold text-black">Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] text-[#8a8a92]">
              This order has changes that haven&apos;t been saved. Moving to the {lookup.pendingNav === "prev" ? "previous" : "next"}{" "}
              client will lose them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9" onClick={lookup.cancelNavigation}>
              Stay here
            </AlertDialogCancel>
            <AlertDialogAction className="h-9" onClick={lookup.confirmDiscardAndNavigate}>
              Discard and continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={form.deleteConfirmOpen} onOpenChange={(open) => !open && form.cancelDelete()}>
        <AlertDialogContent className="w-full max-w-sm gap-3 rounded-[10px] border border-[#dcdce1] bg-white p-5 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px] font-bold text-black">Delete this record?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] text-[#8a8a92]">
              {definition.titleEn} record {state.recordNo} for {state.clientName || "this client"} will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9" onClick={form.cancelDelete}>
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction className="h-9" onClick={form.confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
