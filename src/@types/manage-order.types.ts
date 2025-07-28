import { MilestoneType } from './admin.types'
import { PresetType } from './designer.types'
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
export interface OrderType {
  id: string
  parentOrderId?: string
  branchId?: string
  userId: string
  orderDate: string
  voucherDiscountId?: string
  orderTotal: number
  address?: string
  code: string
  totalPaid: number
  discountSubtotal?: number
  depositSubtotal?: number
  remainingBalance?: number
  serviceAmount?: number
  totalAmount?: number
  shippingFee?: number
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  deliveryMethod?: DeliveryMethod
  paymentType?: PaymentType
  canceledAt?: string
  canceledReason?: string
  subTotalAmount?: number
  warrantyCode?: string
  type: TypeOrder
  status: OrderStatus
  addressId?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updateBy: string
}

export type ItemType = 'READY_TO_BUY' | 'PRESET' | 'DESIGN_REQUEST'
export interface OrderItemType {
  id: string
  orderId: string
  itemType: ItemType
  price: number
  quantity: number
  preset: PresetType
  warrantyDate?: string
  warrantyNumber?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updateBy: string
}

export interface OrderById extends OrderType {
  items: Array<OrderItemType>
}

export interface OrderItemById extends OrderItemType {
  maternityDressDetail: MaternityDressDetailType
  desisgnRequest: DesignRequestType
  milestones: MilestoneType
  preset: PresetType
}

export interface AssignTask {
  milestoneIds: string[]
}

export interface AssignCharge {
  chargeId: string
  orderItemId: string
  milestoneId: string
}

export interface checkListStatus {
  maternityDressTaskIds: Array<string>
  orderItemId: string
  status: OrderStatus
}

export interface DesignRequestType {
  id: string
  userId: string
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
