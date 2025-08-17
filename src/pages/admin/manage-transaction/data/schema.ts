import { z } from 'zod'
import { TransactionType } from '@/@types/transaction.types'

// Transaction schema để validate và transform data
const transactionSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  sepayId: z.string(),
  gateway: z.string(),
  transactionDate: z.string(),
  accountNumber: z.string(),
  code: z.string(),
  content: z.string(),
  transferAmount: z.number(),
  description: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Transaction = z.infer<typeof transactionSchema>

export const transactionListSchema = z.array(transactionSchema)

// Transform function để convert từ API type sang component type
export const transformTransactionTypeToTransaction = (apiTransaction: TransactionType): Transaction => {
  return {
    id: apiTransaction.id,
    orderId: apiTransaction.orderId,
    sepayId: apiTransaction.sepayId,
    gateway: apiTransaction.gateway,
    transactionDate: apiTransaction.transactionDate,
    accountNumber: apiTransaction.accountNumber,
    code: apiTransaction.code,
    content: apiTransaction.content,
    transferAmount: apiTransaction.transferAmount,
    description: apiTransaction.description,
    createdBy: apiTransaction.createdBy,
    updatedBy: apiTransaction.updatedBy,
    createdAt: apiTransaction.createdAt,
    updatedAt: apiTransaction.updatedAt
  }
}

// Mock data giữ nguyên từ file cũ nhưng transform theo schema mới
export const mockTransactionData: Transaction[] = [
  {
    id: '1',
    orderId: '#ODR115352',
    sepayId: 'SPY001',
    gateway: 'Gift Card',
    transactionDate: '2025-03-02T16:30:00Z',
    accountNumber: '1234567890',
    code: 'TXN001',
    content: 'Payment for order #ODR115352',
    transferAmount: 65000,
    description: 'Gift card payment',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-03-02T16:30:00Z',
    updatedAt: '2025-03-02T16:30:00Z'
  },
  {
    id: '2',
    orderId: '#ODR115753',
    sepayId: 'SPY002',
    gateway: 'Coupon',
    transactionDate: '2025-02-08T18:33:00Z',
    accountNumber: '1234567891',
    code: 'TXN002',
    content: 'Payment for order #ODR115753',
    transferAmount: 57000,
    description: 'Coupon discount applied',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-02-08T18:33:00Z',
    updatedAt: '2025-02-08T18:33:00Z'
  },
  {
    id: '3',
    orderId: '#ODR115463',
    sepayId: 'SPY003',
    gateway: 'COD',
    transactionDate: '2025-03-12T05:13:00Z',
    accountNumber: '1234567892',
    code: 'TXN003',
    content: 'Payment for order #ODR115463',
    transferAmount: 63000,
    description: 'Cash on delivery',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-03-12T05:13:00Z',
    updatedAt: '2025-03-12T05:13:00Z'
  },
  {
    id: '4',
    orderId: '#ODR115324',
    sepayId: 'SPY004',
    gateway: 'UPI',
    transactionDate: '2025-03-04T04:30:00Z',
    accountNumber: '1234567893',
    code: 'TXN004',
    content: 'Payment for order #ODR115324',
    transferAmount: 65000,
    description: 'UPI payment',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-03-04T04:30:00Z',
    updatedAt: '2025-03-04T04:30:00Z'
  },
  {
    id: '5',
    orderId: '#ODR115743',
    sepayId: 'SPY005',
    gateway: 'Debit Card',
    transactionDate: '2025-03-06T04:30:00Z',
    accountNumber: '1234567894',
    code: 'TXN005',
    content: 'Payment for order #ODR115743',
    transferAmount: 65000,
    description: 'Debit card payment',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-03-06T04:30:00Z',
    updatedAt: '2025-03-06T04:30:00Z'
  },
  {
    id: '6',
    orderId: '#ODR1151231',
    sepayId: 'SPY006',
    gateway: 'Cash',
    transactionDate: '2025-03-15T04:30:00Z',
    accountNumber: '1234567895',
    code: 'TXN006',
    content: 'Payment for order #ODR1151231',
    transferAmount: 55000,
    description: 'Cash payment',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-03-15T04:30:00Z',
    updatedAt: '2025-03-15T04:30:00Z'
  },
  {
    id: '7',
    orderId: '#ODR115990',
    sepayId: 'SPY007',
    gateway: 'UPI',
    transactionDate: '2025-03-22T04:30:00Z',
    accountNumber: '1234567896',
    code: 'TXN007',
    content: 'Payment for order #ODR115990',
    transferAmount: 65000,
    description: 'UPI payment',
    createdBy: 'system',
    updatedBy: 'system',
    createdAt: '2025-03-22T04:30:00Z',
    updatedAt: '2025-03-22T04:30:00Z'
  }
]
