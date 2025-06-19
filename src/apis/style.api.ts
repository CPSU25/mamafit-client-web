import { api } from '@/lib/axios/axios'
import { StyleType, StyleFormData } from '@/@types/inventory.type'
import { ListBaseResponse, ItemBaseResponse } from '@/@types/response'

interface StyleQueryParams {
  index?: number
  pageSize?: number
  sortBy?: string
  search?: string
}

export const styleAPI = {
  // Get all styles with pagination and filters
  getStyles: (params?: StyleQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.search) queryParams.append('search', params.search)

    const url = `/style${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    return api.get<ListBaseResponse<StyleType>>(url)
  },

  // Get style by ID
  getStyleById: (id: string) => api.get<ItemBaseResponse<StyleType>>(`/style/${id}`),

  // Create new style
  createStyle: (data: StyleFormData) => api.post<ItemBaseResponse<StyleType>>('/style', data),

  // Update style
  updateStyle: (id: string, data: StyleFormData) => api.put<ItemBaseResponse<StyleType>>(`/style/${id}`, data),

  // Delete style
  deleteStyle: (id: string) => api.delete<ItemBaseResponse<StyleType>>(`/style/${id}`)
}
