import {
  AddOnForm,
  AddOnList,
  AddOnOptionForm,
  AddOnOptionList,
  Position,
  Size,
  SizeForm,
  PositionForm
} from '@/@types/add-on.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

export interface AddOnQueryParams {
  index: number
  pageSize: number
  search: string
  sortBy: string
}
const addOnAPI = {
  getAddOns: (params?: AddOnQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    const queryString = queryParams.toString()
    const url = queryString ? `/add-on?${queryString}` : '/add-on'
    return api.get<ListBaseResponse<AddOnList>>(url)
  },
  getAddOnById: (id: string) => api.get<ItemBaseResponse<AddOnList>>(`/add-on/${id}`),
  createAddOn: (data: AddOnForm) => api.post<ItemBaseResponse<[]>>(`/add-on`, data),
  updateAddOn: (id: string, data: AddOnForm) => api.put<ItemBaseResponse<[]>>(`/add-on/${id}`, data),
  deleteAddOn: (id: string) => api.delete<ItemBaseResponse<[]>>(`/add-on/${id}`),
  getAddOnOptions: (addOnId: string) => api.get<ListBaseResponse<AddOnOptionList>>(`/add-on/${addOnId}`),
  createAddOnOption: (data: AddOnOptionForm) => api.post<ItemBaseResponse<[]>>(`/add-on-options`, data),
  updateAddOnOption: (id: string, data: AddOnOptionForm) =>
    api.put<ItemBaseResponse<[]>>(`/add-on-options/${id}`, data),
  deleteAddOnOption: (id: string) => api.delete<ItemBaseResponse<[]>>(`/add-on-options/${id}`),
  getPositions: () => api.get<ListBaseResponse<Position>>(`/position`),
  getSizes: () => api.get<ListBaseResponse<Size>>(`/size`),
  createPosition: (data: PositionForm) => api.post<ItemBaseResponse<[]>>(`/position`, data),
  updatePosition: (id: string, data: PositionForm) => api.put<ItemBaseResponse<[]>>(`/position/${id}`, data),
  deletePosition: (id: string) => api.delete<ItemBaseResponse<[]>>(`/position/${id}`),
  createSize: (data: SizeForm) => api.post<ItemBaseResponse<[]>>(`/size`, data),
  updateSize: (id: string, data: SizeForm) => api.put<ItemBaseResponse<[]>>(`/size/${id}`, data),
  deleteSize: (id: string) => api.delete<ItemBaseResponse<[]>>(`/size/${id}`)
}

export default addOnAPI
