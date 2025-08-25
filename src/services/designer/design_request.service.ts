import designerTaskAPI from '@/apis/designer-task.api'
import { useQuery } from '@tanstack/react-query'

export const designRequestKeys = {
  all: ['templates'] as const,
  lists: () => [...designRequestKeys.all, 'list'] as const,
  details: () => [...designRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...designRequestKeys.details(), id] as const
}

export const useDesignRequestById = (id: string) => {
  const query = useQuery({
    queryKey: designRequestKeys.detail(id),
    queryFn: async () => {
      const response = await designerTaskAPI.getDesignRequestById(id)
      return response.data
    },
    enabled: !!id
  })
  return { ...query, data: query.data?.data }
}
