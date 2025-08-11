import { ConfigFormData } from '@/@types/system-config.types'
import configAPI from '@/apis/system-config.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useGetConfigs = () => {
  return useQuery({
    queryKey: ['configs'],
    queryFn: async () => {
      const response = await configAPI.getConfigs()
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch configs')
    }
  })
}

export const useUpdateConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ConfigFormData) => {
      const response = await configAPI.updateConfig(data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update configs')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs'] })
    }
  })
}
