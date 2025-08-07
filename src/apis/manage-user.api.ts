import { ManageUserType } from '@/@types/admin.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'
import { RoleTypes } from '@/@types/role.types'

interface MaternityDressQueryParams {
  index?: number
  pageSize?: number
  nameSearch?: string
  roleName?: string
}

// Type for creating system account - matching the API payload from image
interface CreateSystemAccountData {
  userName: string
  fullName: string
  password: string
  userEmail: string
  phoneNumber: string
  roleId: string
}

// Keep the old CreateUserData for backward compatibility if needed
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

  // New API for creating system account
  createSystemAccount: (data: CreateSystemAccountData) =>
    api.post<ItemBaseResponse<ManageUserType>>('/api/auth/create-system-account', data),

  // Keep old method for backward compatibility
  createUser: (data: CreateUserData) => api.post<ItemBaseResponse<ManageUserType>>('/user', data),

  updateUser: (id: string, data: ManageUserType) => api.put<ItemBaseResponse<[]>>(`/user/${id}`, data),
  deleteUser: (id: string) => api.delete<ItemBaseResponse<[]>>(`/user/${id}`),
  getRoles: () => api.get<ListBaseResponse<RoleTypes>>('/role')
}

export default manageUserAPI
export type { CreateUserData, CreateSystemAccountData }
