import { z } from 'zod'
import dayjs from 'dayjs'
import { VoucherBatchType, VoucherDiscountType } from '@/@types/admin.types'

const voucherBatchSchema = z.object({
  id: z.string(),
  batchName: z.string(),
  batchCode: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
  totalQuantity: z.number(),
  discountType: z.string(),
  discountValue: z.number(),
  minimumOrderValue: z.string(),
  maximumDiscountValue: z.string(),
  isAutoGenerate: z.boolean(),
  remainingQuantity: z.number(),
  status: z.string().optional(), // Computed status field
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string(),
  updatedBy: z.string()
})

export type VoucherBatch = z.infer<typeof voucherBatchSchema>

const voucherDiscountSchema = z.object({
  id: z.string(),
  voucherBatchId: z.string(),
  code: z.string(),
  status: z.string(),
  isDeleted: z.boolean(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string(),
  updatedBy: z.string()
})

export type VoucherDiscount = z.infer<typeof voucherDiscountSchema>

export const voucherBatchListSchema = z.array(voucherBatchSchema)
export const voucherDiscountListSchema = z.array(voucherDiscountSchema)

// Helper function to calculate status
const calculateVoucherBatchStatus = (startDate: string, endDate: string, remainingQuantity: number): string => {
  const now = dayjs()
  const start = dayjs(startDate)
  const end = dayjs(endDate)

  if (remainingQuantity === 0) {
    return 'USED_UP'
  }

  if (now.isBefore(start)) {
    return 'PENDING'
  }

  if (now.isAfter(end)) {
    return 'EXPIRED'
  }

  return 'ACTIVE'
}

// Transform API data to schema format
export const transformVoucherBatchToSchema = (apiVoucherBatch: VoucherBatchType): VoucherBatch => {
  const status = calculateVoucherBatchStatus(
    apiVoucherBatch.startDate,
    apiVoucherBatch.endDate,
    apiVoucherBatch.remainingQuantity
  )

  return {
    id: apiVoucherBatch.id,
    batchName: apiVoucherBatch.batchName,
    batchCode: apiVoucherBatch.batchCode,
    startDate: apiVoucherBatch.startDate,
    endDate: apiVoucherBatch.endDate,
    description: apiVoucherBatch.description,
    totalQuantity: apiVoucherBatch.totalQuantity,
    discountType: apiVoucherBatch.discountType,
    discountValue: apiVoucherBatch.discountValue,
    minimumOrderValue: apiVoucherBatch.minimumOrderValue,
    maximumDiscountValue: apiVoucherBatch.maximumDiscountValue,
    isAutoGenerate: apiVoucherBatch.isAutoGenerate,
    remainingQuantity: apiVoucherBatch.remainingQuantity,
    status,
    createdAt: apiVoucherBatch.createdAt,
    updatedAt: apiVoucherBatch.updatedAt,
    createdBy: apiVoucherBatch.createdBy,
    updatedBy: apiVoucherBatch.updatedBy
  }
}

export const transformVoucherDiscountToSchema = (apiVoucherDiscount: VoucherDiscountType): VoucherDiscount => {
  return {
    id: apiVoucherDiscount.id,
    voucherBatchId: apiVoucherDiscount.voucherBatchId,
    code: apiVoucherDiscount.code,
    status: apiVoucherDiscount.status,
    isDeleted: apiVoucherDiscount.isDeleted,
    createdAt: apiVoucherDiscount.createdAt,
    updatedAt: apiVoucherDiscount.updatedAt,
    createdBy: apiVoucherDiscount.createdBy,
    updatedBy: apiVoucherDiscount.updatedBy
  }
}
