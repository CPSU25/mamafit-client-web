import { BranchWarrantyRequestForm, WarrantyRequestItemForm } from '@/@types/warranty-request.types'
import warrantyAPI, { WarrantyRequestListParams } from '@/apis/warranty-request.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const warrantyKey = {
  all: ['warranty'] as const,
  lists: () => [...warrantyKey.all, 'list'] as const,
  list: (params: WarrantyRequestListParams) => [...warrantyKey.lists(), params] as const,
  details: () => [...warrantyKey.all, 'detail'] as const,
  detail: (id: string) => [...warrantyKey.details(), id] as const
}

export const useWarrantyRequestList = (params: WarrantyRequestListParams) => {
  return useQuery({
    queryKey: warrantyKey.list(params),
    queryFn: () => warrantyAPI.getWarrantyRequestList(params),
    select: (data) => data.data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false
  })
}

export const useWarrantyRequestById = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: warrantyKey.detail(id),
    queryFn: () => warrantyAPI.getWarrantyRequestById(id),
    select: (data) => data.data.data,
    enabled: options?.enabled ?? true
  })
}

export const useCreateBranchWarrantyRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BranchWarrantyRequestForm) => warrantyAPI.createWarrantyRequest(data),
    onSuccess: () => {
      toast.success('Tạo yêu cầu bảo hành thành công')
      queryClient.invalidateQueries({ queryKey: warrantyKey.lists() })
    },
    onError: () => {
      toast.error('Tạo yêu cầu bảo hành thất bại')
    }
  })
}

export const useSubmitDecisionMutation = (request: { id: string }) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { noteInternal: string; items: WarrantyRequestItemForm[] }) => {
      return warrantyAPI.decisionWarrantyRequest(request.id, data)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật quyết định bảo hành thành công')
      queryClient.invalidateQueries({ queryKey: warrantyKey.lists() })
      queryClient.invalidateQueries({ queryKey: warrantyKey.detail(request.id) })
    },
    onError: (error) => {
      console.error('Error submitting warranty decision:', error)
      toast.error('Có lỗi xảy ra khi cập nhật quyết định bảo hành')
    }
  })
}
