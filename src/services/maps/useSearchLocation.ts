import goongAPI from '@/apis/api.goong'
import { useQuery } from '@tanstack/react-query'

export const useSearchLocation = (locationName: string) => {
  return useQuery({
    queryKey: ['searchLocation', locationName],
    queryFn: () => goongAPI.autocomplete(locationName),
    enabled: !!locationName
  })
}
