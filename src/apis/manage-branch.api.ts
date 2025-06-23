import { BranchRequest, ManageBranchType } from '@/@types/branch.type'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

export interface BranchQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

const manageBranchAPI = {
  getBranchs: (params?: BranchQueryParams) => {
    const queryParams = new URLSearchParams()

    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    const queryString = queryParams.toString()
    const url = queryString ? `/branch?${queryString}` : '/branch'
    return api.get<ListBaseResponse<ManageBranchType>>(url)
  },
  createBranch: (body: BranchRequest) => api.post<ItemBaseResponse<[]>>('/branch', body),
  updateBranch: (id: string, body: BranchRequest) => api.put<ItemBaseResponse<[]>>(`/branch/${id}`, body),
  deleteBranch: (id: string) => api.delete<ItemBaseResponse<[]>>(`/branch/${id}`)
}

export default manageBranchAPI
