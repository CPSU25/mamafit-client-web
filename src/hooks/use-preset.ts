import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { presetApi } from '@/apis/preset.api'
import { toast } from 'sonner'

// Hook để lấy danh sách preset
export const usePresets = (params?: { index?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['presets', params],
    queryFn: () => presetApi.getPresets(params),
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

// Hook để lấy chi tiết preset
export const usePresetById = (id: string) => {
  return useQuery({
    queryKey: ['preset', id],
    queryFn: () => presetApi.getPresetById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

// Hook để gửi preset cho design request
export const useSendPresetToDesignRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: presetApi.sendPresetToDesignRequest,
    onSuccess: () => {
      toast.success('Đã gửi preset cho khách hàng thành công!')

      // Invalidate các queries liên quan
      queryClient.invalidateQueries({ queryKey: ['designer-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['design-requests'] })
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Có lỗi xảy ra khi gửi preset'
      toast.error(errorMessage)
    }
  })
}
