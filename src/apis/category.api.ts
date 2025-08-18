import { CategoryFormData, CategoryType, StyleType, StyleFormData } from '@/@types/manage-maternity-dress.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

interface CategoryQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

interface StyleQueryParams {
  index?: number
  pageSize?: number
  sortBy?: string
}

const categoryAPI = {
  getCategories: (params?: CategoryQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

    const queryString = queryParams.toString()
    const url = queryString ? `/category?${queryString}` : '/category'

    return api.get<ListBaseResponse<CategoryType>>(url)
  },

  createCategory: (body: CategoryFormData) => api.post<ItemBaseResponse<CategoryType>>('/category', body),
  updateCategory: (id: string, body: CategoryFormData) =>
    api.put<ItemBaseResponse<CategoryType>>(`/category/${id}`, body),
  deleteCategory: (id: string) => api.delete<ItemBaseResponse<CategoryType>>(`/category/${id}`),
  getStylesByCategory: (categoryId: string, params?: StyleQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)

    const queryString = queryParams.toString()
    const url = queryString ? `/style/by-category/${categoryId}?${queryString}` : `/style/by-category/${categoryId}`

    return api.get<ListBaseResponse<StyleType>>(url)
  },
  createStyle: (body: StyleFormData) => api.post<ItemBaseResponse<StyleType>>('/style', body),
  deleteStyle: (id: string) => api.delete<ItemBaseResponse<[]>>(`/style/${id}`)
}

export default categoryAPI
