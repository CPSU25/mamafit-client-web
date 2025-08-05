/**
 * GHTK API Response Types
 * Định nghĩa các interface cho GHTK shipping API
 */

export interface GHTKProduct {
  name: string
  weight: number
  quantity: number
  price: number
}

export interface GHTKOrder {
  partnerId: string
  label: string
  area: string
  fee: string
  insuranceFee: string
  trackingId: number
  estimatedPickTime: string
  estimatedDeliverTime: string
  products: GHTKProduct[]
  statusId: number
}

export interface GHTKCreateShippingResponse {
  order: GHTKOrder
  success: boolean
  message: string
}

/**
 * GHTK Status mapping
 */
export const GHTK_STATUS: Record<number, { label: string; color: string }> = {
  1: { label: 'Chờ duyệt', color: 'orange' },
  2: { label: 'Đã duyệt', color: 'blue' },
  3: { label: 'Đang lấy hàng', color: 'indigo' },
  4: { label: 'Đã lấy hàng', color: 'purple' },
  5: { label: 'Đang giao hàng', color: 'cyan' },
  6: { label: 'Đã giao hàng', color: 'green' },
  7: { label: 'Giao hàng thất bại', color: 'red' },
  8: { label: 'Hoàn hàng', color: 'yellow' },
  9: { label: 'Hủy đơn', color: 'gray' }
}
