// =====================================================================
// File: src/@types/manage-order.types.ts
// Mô tả: Types cho manage order - đã tách riêng khỏi admin task types
// =====================================================================

import { MeasurementType } from '@/pages/staff/manage-task/tasks/types'
import { PresetType } from './designer.types'
import { AddressType } from './global.types'
import { MaternityDressDetailType } from './inventory.type'
import { MilestoneType } from './admin.types'
import HttpStatusCode from '@/lib/utils/httpStatusCode.enum'

//Manage Order Type
export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  AWAITING_PAID_REST = 'AWAITING_PAID_REST',
  PACKAGING = 'PACKAGING',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED'
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID_FULL = 'PAID_FULL',
  FAILED = 'FAILED',
  PAID_DEPOSIT = 'PAID_DEPOSIT',
  PAID_DEPOSIT_COMPLETED = 'PAID_DEPOSIT_COMPLETED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED'
}
export enum PaymentMethod {
  CASH = 'CASH',
  ONLINE_BANKING = 'ONLINE_BANKING'
}
export enum DeliveryMethod {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP'
}
export enum TypeOrder {
  NORMAL = 'NORMAL',
  WARRANTY = 'WARRANTY',
  DESIGN = 'DESIGN'
}
export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  FULL = 'FULL'
}

export enum ItemType {
  READY_TO_BUY = 'READY_TO_BUY',
  PRESET = 'PRESET',
  DESIGN_REQUEST = 'DESIGN_REQUEST'
}
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
  measurementDiary: MeasurementDiaryType
}

export interface MeasurementDiaryType {
  id: string
  userId: string
  name: string
  age: number
  height: number
  weight: number
  bust: number
  waist: number
  hip: number
  firstDateOfLastPeriod: string
  averageMenstrualCycle: number
  numberOfPregnancy: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
  measurements: MeasurementType[]
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

//Status Timeline of OrderItem
export interface StatusOrderItemTimeline {
  progress: number
  isDone: boolean
  currentTask: {
    id: string
    name: string
  }
  milestone: MilestoneType
}
export interface StatusOrderItemResponse<T> {
  data: T[]
  message: string
  statusCode: HttpStatusCode
  code: string
}
