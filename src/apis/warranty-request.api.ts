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
  page: number
  limit: number
  search: string
  sortBy: 'CREATED_AT_DESC' | 'CREATED_AT_ASC'
  // status: StatusWarrantyRequest
}
const warrantyAPI = {
  getWarrantyRequestList: (params: WarrantyRequestListParams) =>
    api.get<ListBaseResponse<WarrantyRequestList>>('/warranty-request', { params }),
  getWarrantyRequestById: (id: string) => api.get<ItemBaseResponse<WarrantyRequestById>>(`/warranty-request/${id}`),
  decisionWarrantyRequest: (id: string, data: DecisionWarrantyRequestForm) =>
    api.post<ItemBaseResponse<WarrantyRequestById>>(`/warranty-request/decisions/${id}`, data),
  createWarrantyRequest: (data: BranchWarrantyRequestForm) =>
    api.post<ItemBaseResponse<[]>>(`/warranty-request/branch-manager`, data),
  createShippingWarrantyRequestFee: (warrantyRequestId: string) =>
    api.post<ItemBaseResponse<[]>>(`/warranty-request/ship-paid/${warrantyRequestId}`)
}
export default warrantyAPI
