import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import {
  ComponentByIdType,
  ComponentOptionType,
  ComponentType,
  ComponentTypeFormData,
  ComponentOptionFormData
} from '@/@types/manage-component.types'
import { api } from '@/lib/axios/axios'

interface ComponentQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

const ManageComponentAPI = {
  getComponents: (params?: ComponentQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

    const queryString = queryParams.toString()
    const url = queryString ? `/component?${queryString}` : '/component'

    return api.get<ListBaseResponse<ComponentType>>(url)
  },
  getComponentById: (id: string) => api.get<ItemBaseResponse<ComponentByIdType>>(`/component/${id}`),
  createComponent: (data: ComponentTypeFormData) => api.post<ItemBaseResponse<ComponentType>>('/component', data),
  updateComponent: (id: string, data: ComponentTypeFormData) =>
    api.put<ItemBaseResponse<ComponentType>>(`/component/${id}`, data),
  deleteComponent: (id: string) => api.delete<ItemBaseResponse<null>>(`/component/${id}`),

  // Component Options
  getComponentOptions: (componentId: string) =>
    api.get<ListBaseResponse<ComponentOptionType>>(`/component/${componentId}`),
  createComponentOption: (data: ComponentOptionFormData) =>
    api.post<ItemBaseResponse<ComponentOptionType>>('/component-option', data),
  updateComponentOption: (componentOptionId: string, data: ComponentOptionType) =>
    api.put<ItemBaseResponse<ComponentOptionType>>(`/component-option/${componentOptionId}`, data),
  deleteComponentOption: (componentOptionId: string) =>
    api.delete<ItemBaseResponse<null>>(`/component-option/${componentOptionId}`)
}

export default ManageComponentAPI
