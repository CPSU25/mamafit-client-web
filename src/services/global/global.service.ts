import globalAPI from '@/apis/global.api'
import { useQuery } from '@tanstack/react-query'

export const useGetAddress = (id: string) => {
  return useQuery({
    queryKey: ['address', id],
    queryFn: async () => {
      const response = await globalAPI.getAddress(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch address')
    }
  })
}
