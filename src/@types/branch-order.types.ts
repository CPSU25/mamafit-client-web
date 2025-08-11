import HttpStatusCode from '@/lib/utils/httpStatusCode.enum'
import { PresetType } from './designer.types'
import { MaternityDressDetailType } from './inventory.type'
import {
  DesignRequestType,
  ItemType,
  MeasurementDiaryType,
  TypeOrder,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  DeliveryMethod,
  PaymentType
} from './manage-order.types'

export interface BranchOrderType {
  id: string
  addressId: string | null
  code: string
  trackingOrderCode: string | null
  discountSubtotal: number
  depositSubtotal: number | null
  remainingBalance: number | null
  totalPaid: number
  receivedAt: string | null
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  measurementDiary: MeasurementDiaryType | null
  items: BranchOrderItemType[]
  branchId: string
  userId: string
  voucherDiscountId: string | null
  type: TypeOrder
  status: OrderStatus
  totalAmount: number | null
  shippingFee: number | null
  serviceAmount: number | null
  paymentStatus: PaymentStatus | null
  paymentMethod: PaymentMethod | null
  deliveryMethod: DeliveryMethod | null
  paymentType: PaymentType | null
  canceledAt: string | null
  canceledReason: string | null
  subTotalAmount: number | null
  warrantyCode: string | null
}

export interface BranchOrderItemType {
  id: string
  parentOrderItemId: string | null
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  maternityDressDetail: MaternityDressDetailType | null
  preset: PresetType | null
  designRequest: DesignRequestType | null
  addOnOptions: string[] | null
  orderId: string
  maternityDressDetailId: string | null
  presetId: string | null
  itemType: ItemType
  price: number
  quantity: number
  warrantyDate: string | null
}


export interface BranchResponse<T>{
    data: T[]
    message: string 
    statusCode: HttpStatusCode
    code: string 
}