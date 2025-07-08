import { LocationDetailAPIResponse, SearchLocationAPIResponse } from '@/@types/maps.type'
import { api } from '@/lib/axios/axios'

const apiKey = import.meta.env.VITE_GOONG_MAP_API_KEY

if (!apiKey) {
  throw new Error('Goong API Key is required')
}

const goongAPI = {
  autocomplete: async (location: string) => {
    const { data } = await api.get<SearchLocationAPIResponse>(
      `https://rsapi.goong.io/Place/AutoComplete?api_key=${apiKey}&input=${location}`
    )
    return data
  },
  getLocationDetailById: async (id: string) => {
    const { data } = await api.get<LocationDetailAPIResponse>(
      `https://rsapi.goong.io/Place/Detail?place_id=${id}&api_key=${apiKey}`
    )
    return data.result
  }
}

export default goongAPI
