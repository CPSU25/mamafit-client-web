import { z } from 'zod'
import {
  DeliveryMethod,
  OrderType,
  PaymentType,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  TypeOrder
} from '@/@types/manage-order.types'

// Validation schema for order filters
export const orderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum([
      'CREATED',
      'CONFIRMED',
      'IN_DESIGN',
      'IN_PRODUCTION',
      'AWAITING_PAID_REST',
      'IN_QC',
      'IN_WARRANTY',
      'PACKAGING',
      'DELIVERING',
      'COMPLETED',
      'WARRANTY_CHECK',
      'CANCELLED',
      'RETURNED',
      'EXPIRED'
    ])
    .optional(),
  paymentStatus: z
    .enum(['PENDING', 'PAID_FULL', 'FAILED', 'PAID_DEPOSIT', 'PAID_DEPOSIT_COMPLETED', 'CANCELED', 'EXPIRED'])
    .optional(),
  paymentMethod: z.enum(['CASH', 'ONLINE_BANKING']).optional(),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  index: z.number().optional(),
  pageSize: z.number().optional()
})

// Schema for order status update
export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'CREATED',
    'CONFIRMED',
    'IN_DESIGN',
    'IN_PRODUCTION',
    'AWAITING_PAID_REST',
    'IN_QC',
    'IN_WARRANTY',
    'PACKAGING',
    'DELIVERING',
    'COMPLETED',
    'WARRANTY_CHECK',
    'CANCELLED',
    'RETURNED',
    'EXPIRED'
  ]),
  paymentStatus: z.enum([
    'PENDING',
    'PAID_FULL',
    'FAILED',
    'PAID_DEPOSIT',
    'PAID_DEPOSIT_COMPLETED',
    'CANCELED',
    'EXPIRED'
  ])
})

// Transform function to ensure data consistency
export const transformOrderData = (order: Partial<OrderType>): OrderType => {
  return {
    id: order.id || '',
    parentOrderId: order.parentOrderId,
    branchId: order.branchId,
    userId: order.userId || '',
    totalPaid: order.totalPaid || 0,
    voucherDiscountId: order.voucherDiscountId,
    code: order.code || '',
    discountSubtotal: order.discountSubtotal || 0,
    depositSubtotal: order.depositSubtotal || 0,
    remainingBalance: order.remainingBalance || 0,
    totalAmount: order.totalAmount || 0,
    shippingFee: order.shippingFee || 0,
    paymentStatus: order.paymentStatus || PaymentStatus.PENDING,
    paymentMethod: order.paymentMethod || PaymentMethod.CASH,
    deliveryMethod: order.deliveryMethod || DeliveryMethod.DELIVERY,
    paymentType: order.paymentType || PaymentType.FULL,
    canceledAt: order.canceledAt,
    canceledReason: order.canceledReason,
    subTotalAmount: order.subTotalAmount,
    warrantyCode: order.warrantyCode,
    type: order.type || TypeOrder.NORMAL,
    status: order.status || OrderStatus.CREATED,
    addressId: order.addressId || '',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    createdBy: order.createdBy || '',
    updateBy: order.updateBy || ''
  }
}

// Type for form data
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>
export type OrderStatusUpdateFormData = z.infer<typeof orderStatusUpdateSchema>
