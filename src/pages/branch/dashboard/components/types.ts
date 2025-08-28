export type RecentOrder = {
  id: string
  code: string
  totalAmount: number
  status: 'DELIVERING' | 'RECEIVED_AT_BRANCH' | 'COMPLETED' | 'PICKUP_IN_PROGRESS'
  createdAt: string
}

export type WarrantyCard = {
  id: string
  sku: string
  status: 'PENDING' | 'APPROVED' | 'REPAIRING' | 'COMPLETED'
  createdAt: string
  totalFee?: number
}

export type AppointmentMini = {
  id: string
  customer: string
  phone: string
  time: string
  status: 'UP_COMING' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELED'
}

export type BranchKpis = {
  revenueToday: number
  ordersToday: number
  warrantyOpen: number
  appointmentsToday: number
}

export const formatCurrencyVND = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
