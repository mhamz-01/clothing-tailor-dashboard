export const queryKeys = {
  tailors: ["tailors"] as const,
  activeOrderCounts: ["activeOrderCounts"] as const,
  assignedOrders: ["assignedOrders"] as const,
  assignedOrdersManage: ["assignedOrdersManage"] as const,
  orderHistory: ["orderHistory"] as const,
  admins: ["admins"] as const,
  catalogOptions: ["catalogOptions"] as const,
  designCatalog: (partType: string) => ["designCatalog", partType] as const,
  // Shalwar Kameez order form + its Settings page (see
  // hooks/shalwar-kameez/* and use-shalwar-kameez-form.ts).
  buttonPrices: ["buttonPrices"] as const,
  pricingSettings: ["pricingSettings"] as const,
  nextRecordNo: ["nextRecordNo"] as const,
  clientByNo: (clientNo: string) => ["clientByNo", clientNo] as const,
  clientLatestOrder: (clientNo: string) => ["clientLatestOrder", clientNo] as const,
  // Waistcoat / Pant / Coat / Shirt forms (hooks/garment-order/*). Client rows,
  // Record No. preview, pricing settings and button prices reuse the keys above.
  garmentBasePrices: ["garmentBasePrices"] as const,
  garmentLatestOrder: (garment: string, clientNo: string) => ["garmentLatestOrder", garment, clientNo] as const,
}
