import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DressTemplate } from '@/@types/designer.types'
import { presetApi, transformPresetListItem, transformPresetDetail, PresetListParams } from '@/apis/preset.api'

// Query keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters: PresetListParams) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const
}

// React Query hooks
export const useTemplates = (params?: PresetListParams) => {
  return useQuery({
    queryKey: templateKeys.list(params || {}),
    queryFn: async () => {
      const response = await presetApi.getPresets(params)
      return {
        items: response.data.items.map(transformPresetListItem),
        total: response.data.totalCount,
        page: response.data.pageNumber,
        pageSize: response.data.pageSize,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPreviousPage: response.data.hasPreviousPage
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

export const useTemplateDetail = (id: string) => {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: async () => {
      const response = await presetApi.getPresetById(id)
      return transformPresetDetail(response.data)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

export const useCreateTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: presetApi.createPreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success('Tạo mẫu thiết kế thành công!')
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi tạo mẫu thiết kế')
    }
  })
}

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DressTemplate> }) => presetApi.updatePreset(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) })
      toast.success('Cập nhật mẫu thiết kế thành công!')
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật mẫu thiết kế')
    }
  })
}

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: presetApi.deletePreset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      toast.success('Xóa mẫu thiết kế thành công!')
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa mẫu thiết kế')
    }
  })
}
