import { LocationDetailAPIResponse, SearchLocationAPIResponse } from '@/@types/maps.type'
import { api } from '@/lib/axios/axios'

const apiKey = import.meta.env.VITE_GOONG_MAP_API_KEY

if (!apiKey) {
  throw new Error('Goong API Key is required')
}

// Forward geocoding response type
export interface ForwardGeocodingResponse {
  results: Array<{
    formatted_address: string
    geometry: {
      location: {
        lat: number
        lng: number
      }
    }
    place_id: string
    types: string[]
  }>
  status: string
}

const goongAPI = {
  autocomplete: async (location: string) => {
    const { data } = await api.get<SearchLocationAPIResponse>(
      `https://rsapi.goong.io/geocode?address=${location}&api_key=${apiKey}`
    )
    return data
  },
  getLocationDetailById: async (id: string) => {
    const { data } = await api.get<LocationDetailAPIResponse>(
      `https://rsapi.goong.io/Place/Detail?place_id=${id}&api_key=${apiKey}`
    )
    return data.result
  },
  forwardGeocoding: async (address: string) => {
    const { data } = await api.get<ForwardGeocodingResponse>(
      `https://rsapi.goong.io/geocode?address=${encodeURIComponent(address)}&api_key=${apiKey}`
    )
    return data.results
  }
}

export default goongAPI
