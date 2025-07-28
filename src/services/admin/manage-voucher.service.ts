import { AssignVoucher, VoucherBatchFormData } from '@/@types/admin.types'
import { VoucherQueryParams } from '@/apis/manage-voucher.api'
import manageVoucherApi from '@/apis/manage-voucher.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const voucherBatchKeys = {
  all: ['voucher-batch'] as const,
  lists: () => [...voucherBatchKeys.all, 'list'] as const,
  list: (params: VoucherQueryParams) => [...voucherBatchKeys.lists(), params] as const,
  details: () => [...voucherBatchKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherBatchKeys.details(), id] as const
}

export const voucherDiscountKeys = {
  all: ['voucher-discount'] as const,
  lists: () => [...voucherDiscountKeys.all, 'list'] as const,
  list: (params: VoucherQueryParams) => [...voucherDiscountKeys.lists(), params] as const,
  details: () => [...voucherDiscountKeys.all, 'detail'] as const,
  detail: (id: string) => [...voucherDiscountKeys.details(), id] as const
}

export const useVoucherBatch = (params?: VoucherQueryParams) => {
  return useQuery({
    queryKey: voucherBatchKeys.list(params || {}),
    queryFn: async () => {
      const response = await manageVoucherApi.getVoucherBatch(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch voucher batch')
    }
  })
}

export const useVoucherDiscount = (params?: VoucherQueryParams) => {
  return useQuery({
    queryKey: voucherDiscountKeys.list(params || {}),
    queryFn: async () => {
      const response = await manageVoucherApi.getVoucherDicount(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch voucher discount')
    }
  })
}

export const useCreateVoucherBatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: VoucherBatchFormData) => {
      const response = await manageVoucherApi.createVoucherBatch(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create voucher batch')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherBatchKeys.lists() })
      queryClient.refetchQueries({ queryKey: voucherBatchKeys.list({}) })
    },
    onError: (error) => {
      console.error('Create voucher batch error:', error)
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}

export const useDeleteVoucherBatch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await manageVoucherApi.deletedVoucherBatch(id)
      if (response.data.statusCode === 200 || response.data.statusCode === 204) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete voucher batch')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherBatchKeys.lists() })
      queryClient.invalidateQueries({ queryKey: voucherDiscountKeys.lists() })
      queryClient.refetchQueries({ queryKey: voucherBatchKeys.list({}) })
    },
    onError: (error) => {
      console.error('Delete voucher batch error:', error)
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}

export const useAssignVoucher = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AssignVoucher) => {
      const response = await manageVoucherApi.assignVoucher(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 204) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to assign voucher')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voucherDiscountKeys.lists() })
      queryClient.refetchQueries({ queryKey: voucherDiscountKeys.list({}) })
    }
  })
}
