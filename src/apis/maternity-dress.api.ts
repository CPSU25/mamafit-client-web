import {
  MaternityDressDetail,
  MaternityDressDetailFormData,
  MaternityDressDetailType,
  MaternityDressFormData,
  MaternityDressList
} from '@/@types/inventory.type'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

interface MaternityDressQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

const maternityDressAPI = {
  // Inventory Products
  getMaternityDresses: (params?: MaternityDressQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

    const queryString = queryParams.toString()
    const url = queryString ? `/maternity-dress?${queryString}` : '/maternity-dress'

    return api.get<ListBaseResponse<MaternityDressList>>(url)
  },

  getMaternityDressById: (id: string) => api.get<ItemBaseResponse<MaternityDressDetail>>(`/maternity-dress/${id}`),

  createMaternityDress: (data: MaternityDressFormData) =>
    api.post<ItemBaseResponse<MaternityDressFormData>>('/maternity-dress', data),

  updateMaternityDress: (id: string, data: MaternityDressFormData) =>
    api.put<ItemBaseResponse<[]>>(`/maternity-dress/${id}`, data),

  deleteMaternityDress: (id: string) => api.delete<ItemBaseResponse<[]>>(`/maternity-dress/${id}`),

  // Maternity Dresses Details
  // getMaternityDressDetails: (params?: MaternityDressQueryParams) => {
  //   const queryParams = new URLSearchParams()

  //   if (params?.index) queryParams.append('index', params.index.toString())
  //   if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
  //   if (params?.search) queryParams.append('search', params.search)
  //   if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

  //   const queryString = queryParams.toString()
  //   const url = queryString ? `/maternity-dress-detail?${queryString}` : '/maternity-dress-detail'

  //   return api.get<ListBaseResponse<MaternityDressDetailType>>(url)
  // },

  // getMaternityDressDetailById: (id: string) =>
  //   api.get<ItemBaseResponse<MaternityDressDetailType>>(`/maternity-dress-detail/${id}`),

  createMaternityDressDetail: (data: MaternityDressDetailFormData) =>
    api.post<ItemBaseResponse<MaternityDressDetailType>>('/maternity-dress-detail', data),

  updateMaternityDressDetail: (id: string, data: MaternityDressDetailFormData) =>
    api.put<ItemBaseResponse<[]>>(`/maternity-dress-detail/${id}`, data),

  deleteMaternityDressDetail: (id: string) =>
    api.delete<ItemBaseResponse<[]>>(`/maternity-dress-detail/${id}`)
}

export default maternityDressAPI
