import { z } from 'zod'
import { BranchOrderType } from '@/@types/branch-order.types'

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
export const transformOrderData = (order: Partial<BranchOrderType>): BranchOrderType => {
  return {
    id: order.id || '',
    branchId: order.branchId || '',
    userId: order.userId || '',
    totalPaid: order.totalPaid || 0,
    voucherDiscountId: order.voucherDiscountId || '',
    code: order.code || '',
    discountSubtotal: order.discountSubtotal || 0,
    depositSubtotal: order.depositSubtotal || null,
    remainingBalance: order.remainingBalance || null,
    totalAmount: order.totalAmount || null,
    shippingFee: order.shippingFee || null,
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: order.paymentMethod || 'CASH',
    deliveryMethod: order.deliveryMethod || 'DELIVERY',
    paymentType: order.paymentType || 'FULL',
    canceledAt: order.canceledAt || null,
    canceledReason: order.canceledReason || null,
    subTotalAmount: order.subTotalAmount || null,
    warrantyCode: order.warrantyCode || null,
    type: order.type || 'NORMAL',
    status: order.status || 'CREATED',
    addressId: order.addressId || '',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    createdBy: order.createdBy || '',
    updatedBy: order.updatedBy || '',
    trackingOrderCode: order.trackingOrderCode || null,
    receivedAt: order.receivedAt || null,
    measurementDiary: order.measurementDiary || null,
    items: order.items || [],
    serviceAmount: order.serviceAmount || null
  }
}

// Type for form data
export type OrderFiltersFormData = z.infer<typeof orderFiltersSchema>
export type OrderStatusUpdateFormData = z.infer<typeof orderStatusUpdateSchema>
