import { useQuery } from '@tanstack/react-query'
import goongAPI from '@/apis/api.goong'

export const useForwardGeocoding = (address: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['forward-geocoding', address],
    queryFn: () => goongAPI.forwardGeocoding(address),
    enabled: enabled && !!address && address.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  })
}
