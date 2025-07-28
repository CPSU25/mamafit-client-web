import { PresetByIdType, PresetFormData, PresetType } from '@/@types/designer.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

interface PresetQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}
const managePresetAPI = {
  getPresets: (params?: PresetQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

    const queryString = queryParams.toString()
    const url = queryString ? `/preset?${queryString}` : '/preset'

    return api.get<ListBaseResponse<PresetType>>(url)
  },
  getPresetById: (id: string) => api.get<ItemBaseResponse<PresetByIdType>>(`/preset/${id}`),
  createPreset: (data: PresetFormData) => api.post<ItemBaseResponse<[]>>('/preset', data),
  updatePreset: (id: string, data: PresetFormData) => api.put<ItemBaseResponse<[]>>(`/preset/${id}`, data),
  deletePreset: (id: string) => api.delete<ItemBaseResponse<[]>>(`/preset/${id}`)
}

export default managePresetAPI
