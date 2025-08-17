export type TransactionType = {
  id: string
  orderId: string
  sepayId: string
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string
  content: string
  transferAmount: number
  description: string
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface TransactionQueryParams {
  index?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}
