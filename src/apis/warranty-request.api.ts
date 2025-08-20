import { ItemBaseResponse } from './../@types/response'
import { ListBaseResponse } from '@/@types/response'
import {
  WarrantyRequestById,
  DecisionWarrantyRequestForm,
  WarrantyRequestList,
  BranchWarrantyRequestForm
} from '@/@types/warranty-request.types'
import { api } from '@/lib/axios/axios'

export type WarrantyRequestListParams = {
  index: number
  pageSize: number
  search: string
  sortBy: 'CREATED_AT_DESC' | 'CREATED_AT_ASC'
  // status: StatusWarrantyRequest
}
const warrantyAPI = {
  getWarrantyRequestList: (params: WarrantyRequestListParams) =>
    api.get<ListBaseResponse<WarrantyRequestList>>('/warranty-request', { params }),
  getWarrantyRequestOfBranch: (params: WarrantyRequestListParams) =>
    api.get<ListBaseResponse<WarrantyRequestList>>('/warranty-request/branch', { params }),
  getWarrantyRequestById: (id: string) => api.get<ItemBaseResponse<WarrantyRequestById>>(`/warranty-request/${id}`),
  decisionWarrantyRequest: (id: string, data: DecisionWarrantyRequestForm) =>
    api.post<ItemBaseResponse<WarrantyRequestById>>(`/warranty-request/decisions/${id}`, data),
  createWarrantyRequest: (data: BranchWarrantyRequestForm) =>
    api.post<ItemBaseResponse<[]>>(`/warranty-request/branch-manager`, data),
  createShippingWarrantyRequestFee: (warrantyRequestId: string) =>
    api.post<ItemBaseResponse<[]>>(`/warranty-request/ship-paid/${warrantyRequestId}`),
  completeWarrantyRequest: (warrantyRequestId: string) =>
    api.put<ItemBaseResponse<[]>>(`/warranty-request/complete-warranty-request/${warrantyRequestId}`)
}
export default warrantyAPI
