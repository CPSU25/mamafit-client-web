import { MilestoneByIdType, MilestoneType } from './admin.types'
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
export interface OrderItemType {
  id: string
  orderId: string
  itemType: ItemType
  price: number
  quantity: number
  maternityDressDetail: MaternityDressDetailType
  designRequest: DesignRequestType
  milestones: MilestoneType
  preset: PresetType
  warrantyDate?: string
  warrantyNumber?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updateBy: string
  address?: string
}

export interface OrderById extends OrderType {
  items: Array<OrderItemType>
  address?: AddressType
}

export interface OrderItemById extends OrderItemType {
  maternityDressDetail: MaternityDressDetailType
  designRequest: DesignRequestType
  milestones: MilestoneByIdType
  preset: PresetType
}

export interface AssignTask {
  milestoneIds: string[]
}

export interface AssignCharge {
  chargeId: string
  orderItemIds: string[]
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
  username: string
  description: string
  images: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string | null
}
