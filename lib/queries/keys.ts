export const queryKeys = {
  tailors: ["tailors"] as const,
  activeOrderCounts: ["activeOrderCounts"] as const,
  assignedOrders: ["assignedOrders"] as const,
  assignedOrdersManage: ["assignedOrdersManage"] as const,
  orderHistory: ["orderHistory"] as const,
  admins: ["admins"] as const,
  catalogOptions: ["catalogOptions"] as const,
  designCatalog: (partType: string) => ["designCatalog", partType] as const,
}
