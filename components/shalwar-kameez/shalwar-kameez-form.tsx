"use client"

import { ActionBar } from "@/components/shalwar-kameez/action-bar"
import { ClientLookupSection } from "@/components/shalwar-kameez/client-lookup-section"
import { MeasurementsPanel } from "@/components/shalwar-kameez/measurements-panel"
import { OrderSummaryPanel } from "@/components/shalwar-kameez/order-summary-panel"
import { StyleOptionsPanel } from "@/components/shalwar-kameez/style-options-panel"
import { useShalwarKameezForm } from "@/hooks/shalwar-kameez/use-shalwar-kameez-form"

// Order-entry form for the Shalwar Kameez category. All state lives in
// use-shalwar-kameez-form; this component only lays the panels out.
//
// Actions live in the Order Summary column (not a full-width bottom bar) so the
// whole form fits a single viewport without scrolling.
export function ShalwarKameezForm() {
  const form = useShalwarKameezForm()
  const { state } = form

  return (
    <div className="flex w-full flex-col gap-2">
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
      />

      <div className="h-px bg-slate-200" />

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[200px_1fr_360px]">
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
          basicCheckItems={form.basicCheckItems}
          styleFlagItems={form.styleFlagItems}
          partDesignRows={state.partDesigns}
          onPartDesignChange={form.updatePartDesign}
          onPartDesignLabelClick={(row) => form.updateField("statusMsg", `${row.label} selected`)}
          buttonOptions={form.buttonOptions}
          pocketOptions={form.pocketOptions}
          bainOptions={form.bainOptions}
          collarOptions={form.collarOptions}
          damanOptions={form.damanOptions}
          bainStyleNo={state.bainStyleNo}
          onBainStyleNoChange={(value) => form.updateField("bainStyleNo", value)}
          collarStyleNo={state.collarStyleNo}
          onCollarStyleNoChange={(value) => form.updateField("collarStyleNo", value)}
        />

        <div className="flex flex-col gap-2">
          <OrderSummaryPanel
            order={state.order}
            onOrderFieldChange={form.updateOrderField}
            total={form.total}
            balance={form.balance}
          />
          <ActionBar
            statusMsg={state.statusMsg}
            onSave={form.handleSave}
            onClear={form.clearForm}
            onPrev={form.handlePrev}
            onNext={form.handleNext}
            onPrint={form.handlePrint}
            onPrintReceipt={form.handlePrintReceipt}
            onDelete={form.handleDelete}
            onExit={form.handleExit}
          />
        </div>
      </div>
    </div>
  )
}
