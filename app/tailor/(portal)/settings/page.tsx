"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useButtonPrices } from "@/hooks/shalwar-kameez/use-button-prices"
import { usePricingSettings } from "@/hooks/shalwar-kameez/use-pricing-settings"
import { useUpdateButtonPrices, useUpdatePricingSettings } from "@/hooks/shalwar-kameez/use-pricing-settings-mutations"
import { BUTTON_TYPE_OPTIONS } from "@/lib/constants/shalwar-kameez"
import { cn } from "@/lib/utils"
import type { ButtonTypePriceRow, OrderPricingSettings } from "@/types/garment-order"

// Reached via the gear icon on /tailor/categories. Configures the values the
// Shalwar Kameez order form reads to compute Tailoring Amt ((base + selected
// button's price) * Suit Qty, read-only there) and to default Delivery Date
// to Book Date + turnaround days (still hand-editable per order). Shilling
// Amt is NOT configured here -- it's a plain tailor-entered field on the
// order form itself. See order_pricing_settings / button_types.price
// (20260716020000_add_pricing_settings.sql) and use-shalwar-kameez-form.ts.
export default function TailorSettingsPage() {
  const buttonPrices = useButtonPrices()
  const pricingSettings = usePricingSettings()
  const isLoading = buttonPrices.isLoading || pricingSettings.isLoading || !pricingSettings.data

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 py-10">
      <Link href="/tailor/categories" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" />
        Categories
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">
        Pricing Settings
        <span className="mt-1 block font-[family-name:var(--font-urdu)] text-lg font-normal text-slate-600">قیمتوں کی ترتیبات</span>
      </h1>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : (
        <SettingsForm buttonPrices={buttonPrices.pricesByCode} pricingSettings={pricingSettings.data!} />
      )}
    </div>
  )
}

interface SettingsFormProps {
  buttonPrices: Record<string, number>
  pricingSettings: OrderPricingSettings
}

// Split out so its useState initializers can read straight from the already-
// loaded query data -- this only mounts once both queries above have
// resolved, so no effect is needed to sync async data into local edit state.
function SettingsForm({ buttonPrices, pricingSettings }: SettingsFormProps) {
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(BUTTON_TYPE_OPTIONS.map((option) => [option.value, String(buttonPrices[option.value] ?? 0)]))
  )
  const [baseTailoringAmount, setBaseTailoringAmount] = useState(String(pricingSettings.baseTailoringAmount))
  const [deliveryTurnaroundDays, setDeliveryTurnaroundDays] = useState(String(pricingSettings.deliveryTurnaroundDays))
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(null)

  const updateButtonPrices = useUpdateButtonPrices()
  const updatePricingSettings = useUpdatePricingSettings()
  const isSaving = updateButtonPrices.isPending || updatePricingSettings.isPending

  function toAmount(value: string): number {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  async function handleSave() {
    setStatus(null)
    const priceRows: ButtonTypePriceRow[] = BUTTON_TYPE_OPTIONS.map((option) => ({
      code: option.value,
      price: toAmount(prices[option.value] ?? "0"),
    }))
    try {
      await Promise.all([
        updateButtonPrices.mutateAsync(priceRows),
        updatePricingSettings.mutateAsync({
          baseTailoringAmount: toAmount(baseTailoringAmount),
          deliveryTurnaroundDays: Math.trunc(toAmount(deliveryTurnaroundDays)) || 0,
        }),
      ])
      setStatus({ kind: "success", message: "Settings saved." })
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "Could not save settings." })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shalwar Kameez Order Defaults</CardTitle>
          <CardDescription>
            Tailoring Amt fills in automatically on the order form as (Base Tailoring Amt + selected Button Type&apos;s price) ×
            Suit Qty — the tailor can&apos;t edit it per order there. Shilling Amt is entered directly on the order form instead.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid grid-cols-2 items-center gap-2">
            <Label>Base Tailoring Amt</Label>
            <Input type="number" value={baseTailoringAmount} onChange={(e) => setBaseTailoringAmount(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label>Delivery Turnaround (days)</Label>
            <Input type="number" value={deliveryTurnaroundDays} onChange={(e) => setDeliveryTurnaroundDays(e.target.value)} />
          </div>
          <p className="text-xs text-slate-500">
            Delivery Date defaults to Book Date + this many days, but the tailor can still change it for a specific order on the
            order sheet.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Button Type Prices</CardTitle>
          <CardDescription>Added on top of Base Tailoring Amt once a button type is picked on the order form.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          {BUTTON_TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-slate-500">{option.label}</Label>
              <Input
                type="number"
                value={prices[option.value] ?? ""}
                onChange={(e) => setPrices((prev) => ({ ...prev, [option.value]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {status && (
        <span className={cn("text-sm font-semibold", status.kind === "success" ? "text-emerald-600" : "text-red-600")}>
          {status.message}
        </span>
      )}

      <Button type="button" onClick={handleSave} disabled={isSaving} className="w-fit">
        {isSaving ? "Saving…" : "Save Settings"}
      </Button>
    </>
  )
}
