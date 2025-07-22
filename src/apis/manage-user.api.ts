import { ManageUserType } from '@/@types/admin.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

interface MaternityDressQueryParams {
  index?: number
  pageSize?: number
  nameSearch?: string
  roleName?: string
}

// Type for creating new user (might have different fields than full ManageUserType)
interface CreateUserData {
  userName: string
  userEmail: string
  fullName: string
  phoneNumber: string
  roleName: string
  dateOfBirth?: string
  password: string
}

const manageUserAPI = {
  getListUser: (params?: MaternityDressQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.nameSearch) queryParams.append('nameSearch', params.nameSearch)
    if (params?.roleName) queryParams.append('roleName', params.roleName)

    const queryString = queryParams.toString()
    const url = queryString ? `/user?${queryString}` : '/user'

    return api.get<ListBaseResponse<ManageUserType>>(url)
  },

  getUserById: (id: string) => api.get<ItemBaseResponse<ManageUserType>>(`/user/${id}`),
  createUser: (data: CreateUserData) => api.post<ItemBaseResponse<ManageUserType>>('/user', data),
  updateUser: (id: string, data: ManageUserType) => api.put<ItemBaseResponse<[]>>(`/user/${id}`, data),
  deleteUser: (id: string) => api.delete<ItemBaseResponse<[]>>(`/user/${id}`)
}

export default manageUserAPI
export type { CreateUserData }
