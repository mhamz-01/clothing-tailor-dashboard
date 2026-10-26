import { notFound } from "next/navigation"
import { GarmentOrderForm } from "@/components/garment-order/garment-order-form"
import { GARMENT_KEYS, GARMENTS, isGarmentKey } from "@/lib/garments/registry"

// One route serves every garment registered in lib/garments/registry.ts:
// /tailor/orders/waistcoat, /pant, /coat, /shirt. Shalwar Kameez keeps its own
// static sibling route (orders/shalwar-kameez), which takes precedence.
export function generateStaticParams() {
  return GARMENT_KEYS.map((garment) => ({ garment }))
}

export default async function GarmentOrderPage({ params }: PageProps<"/tailor/orders/[garment]">) {
  const { garment } = await params
  if (!isGarmentKey(garment)) notFound()

  // GarmentOrderForm owns its full-viewport backdrop and scaled board, like the
  // Shalwar Kameez page - no wrapper padding/background needed here.
  return <GarmentOrderForm definition={GARMENTS[garment]} />
}
