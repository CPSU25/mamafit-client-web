// =====================================================================
// File: src/@types/manage-order.types.ts
// Mô tả: Types cho manage order - đã tách riêng khỏi admin task types
// =====================================================================

import { PresetType } from './designer.types'
import { AddressType } from './global.types'
import { MaternityDressDetailType } from './inventory.type'

//Manage Order Type
export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'IN_DESIGN'
  | 'IN_PRODUCTION'
  | 'AWAITING_PAID_REST'
  | 'IN_QC'
  | 'IN_WARRANTY'
  | 'PACKAGING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'WARRANTY_CHECK'
  | 'CANCELLED'
  | 'RETURNED'
  | 'EXPIRED'
export type PaymentStatus =
  | 'PENDING'
  | 'PAID_FULL'
  | 'FAILED'
  | 'PAID_DEPOSIT'
  | 'PAID_DEPOSIT_COMPLETED'
  | 'CANCELED'
  | 'EXPIRED'
export type PaymentMethod = 'CASH' | 'ONLINE_BANKING'
export type DeliveryMethod = 'DELIVERY' | 'PICKUP'
export type PaymentType = 'DEPOSIT' | 'FULL'
export type TypeOrder = 'NORMAL' | 'WARRANTY'

/**
 * Basic Order Type - không có milestone details
 */
export interface OrderType {
  id: string
  addressId?: string
  code: string
  discountSubtotal?: number
  depositSubtotal?: number
  remainingBalance?: number
  totalPaid: number
  parentOrderId?: string
  branchId?: string
  userId: string
  voucherDiscountId?: string
  type: TypeOrder
  status: OrderStatus
  totalAmount?: number
  shippingFee?: number
  serviceAmount?: number
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  deliveryMethod?: DeliveryMethod
  paymentType?: PaymentType
  canceledAt?: string
  canceledReason?: string
  subTotalAmount?: number
  warrantyCode?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updateBy: string
}

export type ItemType = 'READY_TO_BUY' | 'PRESET' | 'DESIGN_REQUEST'

/**
 * Basic Order Item Type - không có milestone details phức tạp
 */
export interface OrderItemType {
  id: string
  orderId: string
  itemType: ItemType
  price: number
  quantity: number
  maternityDressDetail: MaternityDressDetailType
  designRequest: DesignRequestType
  milestones: string[] // Generic milestone reference
  preset: PresetType
  warrantyDate?: string
  warrantyNumber?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updateBy: string
  address?: string
}

/**
 * Order with items (basic level)
 */
export interface OrderById extends OrderType {
  items: Array<OrderItemType>
  address?: AddressType
}

/**
 * Basic Order Item by ID - không có chi tiết milestone tasks
 */
export interface OrderItemById extends OrderItemType {
  maternityDressDetail: MaternityDressDetailType
  designRequest: DesignRequestType
  milestones: string[] // Generic - sẽ được handle ở admin hoặc staff service riêng
  preset: PresetType
}

/**
 * Legacy assign task interface - có thể sẽ deprecated
 */
export interface AssignTask {
  milestoneIds: string[]
}

/**
 * Assign charge interface - được dùng chung cho admin
 */
export interface AssignCharge {
  chargeId: string
  orderItemIds: string[]
  milestoneId: string
}

/**
 * Check list status interface
 */
export interface checkListStatus {
  maternityDressTaskIds: Array<string>
  orderItemId: string
  status: OrderStatus
}

/**
 * Design Request Type
 */
export interface DesignRequestType {
  id: string
  userId: string
  username: string
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string | null
}
