import { useMutation } from '@tanstack/react-query'
import ghtkAPI from '@/apis/ghtk.api'

export const useCreateShipping = () => {
  return useMutation({
    mutationFn: ghtkAPI.createShipping,
    mutationKey: ['create-shipping']
  })
}