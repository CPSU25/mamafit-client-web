import { OrderItemType } from './manage-order.types'

export enum RequestType {
  FREE = 'FREE', //trong hạn bảo hành hết phí
  FEE = 'FEE' //hết hạn bảo hành, có phí
}
export enum StatusWarrantyRequest {
  PENDING = 'PENDING',
  REPAIRING = 'REPAIRING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  PARTIALLY_REJECTED = 'PARTIALLY_REJECTED', // Một số item được chấp nhận, một số bị từ chối
  CANCELLED = 'CANCELLED'
}
export enum StatusWarrantyRequestItem {
  IN_TRANSIT = 'IN_TRANSIT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}
export interface WarrantyRequestList {
  id: string
  sku: string
  noteInternal: string | null
  requestType: RequestType
  rejectReason: string | null
  totalFee: number | null
  customer: {
    id: string
    fullName: string
    phoneNumber: string
    userEmail: string
  }
  status: StatusWarrantyRequest
  countItem: number | 0
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface WarrantyRequestById extends WarrantyRequestList {
  items: WarramtyRequestItems[]
}

export interface WarramtyRequestItems {
  orderItemId: string
  destinationBranchId: string | null
  trackingCode: string | null
  fee: number | null
  rejectedReason: string | null
  description: string
  images: string[]
  status: StatusWarrantyRequestItem
  estimateTime: string | null
  destinationType: 'FACTORY' | 'BRANCH'
  warrantyRound: number | 0
  orders: OrderOfWarranty[]
  histories: string[]
  createdAt: string
  updatedAt: string
}
export interface OrderOfWarranty {
  id: string
  code: string
  receivedAt: string | null
  orderItems: OrderItemOfWarranty[]
}

export interface OrderItemOfWarranty extends OrderItemType {
  parentOrderItemId: string
}

//Decision Warranty Request
export interface DecisionWarrantyRequestForm {
  noteInternal: string
  items: WarrantyRequestItemForm[]
}
export interface WarrantyRequestItemForm {
  orderItemId: string
  status: StatusWarrantyRequestItem
  destinationType: 'FACTORY' | 'BRANCH'
  destinationBranchId: string | null
  fee: number | null
  rejectedReason: string | null
  estimateTime: string | null
}
export interface DecisionWarrantyResponse {
  requestStatus: StatusWarrantyRequest
  items: DecisionWarrantyItemResponse[]
}

export interface DecisionWarrantyItemResponse {
  orderItemId: string
  status: StatusWarrantyRequestItem
  trackingCode: string | null
}
