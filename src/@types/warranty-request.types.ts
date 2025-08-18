import { OrderItemType, OrderStatus, PaymentMethod } from './manage-order.types'

export enum RequestType {
  FREE = 'FREE', //trong hạn bảo hành hết phí
  FEE = 'FEE' //hết hạn bảo hành, có phí
}
export enum StatusWarrantyRequest {
  PENDING = 'PENDING', //Chờ duyệt yêu cầu
  APPROVED = 'APPROVED', // Đã chấp nhận bảo hành
  REPAIRING = 'REPAIRING', // Đang sửa chữa
  COMPLETED = 'COMPLETED', //Request này đã hoàn thành
  REJECTED = 'REJECTED', //Từ chối bảo hành
  PARTIALLY_REJECTED = 'PARTIALLY_REJECTED', // Một số item được chấp nhận, một số bị từ chối
  CANCELLED = 'CANCELLED' //Hủy yêu cầu bảo hành
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
  orderStatus: OrderStatus
  // Lưu ý: API có thể trả về pickAddressId (đúng chính tả)
  // nhưng type cũ đang là pickAdrressId (sai chính tả). Hỗ trợ cả hai để tương thích.
  pickAddressId?: string
  items: WarrantyRequestItems[]
}

export interface WarrantyRequestItems {
  orderItemId: string
  destinationBranchId: string | null
  trackingCode: string | null
  fee: number | null
  shippingFee: number | null
  rejectedReason: string | null
  description: string
  images: string[]
  video: string[]
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
  shippingFee: number | null
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

//type of branch create warranty offline
export interface BranchWarrantyRequestForm {
  paymentMethod: PaymentMethod
  items: BranchWarrantyRequestItemForm[]
}
export interface BranchWarrantyRequestItemForm {
  orderItemId: string
  description: string
  images: string[]
  videos: string[]
}
