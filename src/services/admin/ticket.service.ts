import ticketAPI from '@/apis/ticket.api'
import { useQuery } from '@tanstack/react-query'

export const useGetTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await ticketAPI.getTickets()
      if (response.status !== 200) {
        throw new Error('Failed to fetch tickets')
      }
      return response.data
    }
  })
}
