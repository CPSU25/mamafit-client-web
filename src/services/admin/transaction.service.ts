import { TransactionQueryParams } from '@/@types/transaction.types'
import transactionAPI from '@/apis/transaction.api'
import { useQuery } from '@tanstack/react-query'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionQueryParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'details'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const
}

export const useTransactions = (params?: TransactionQueryParams) => {
  return useQuery({
    queryKey: transactionKeys.list(params || {}),
    queryFn: async () => {
      const response = await transactionAPI.getTransactionList(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch transactions')
    },
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}
