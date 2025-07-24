import { VoucherBatchFormData, VoucherBatchType, VoucherDiscountType } from '@/@types/admin.types'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

export interface VoucherQueryParams {
  index?: number
  pageSize?: number
  codeSearch?: string
}
const manageVoucherApi = {
  getVoucherBatch: (params?: VoucherQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.codeSearch) queryParams.append('codeSearch', params.codeSearch)
    const queryString = queryParams.toString()
    const url = queryString ? `/voucher-batch?${queryString}` : '/voucher-batch'
    return api.get<ListBaseResponse<VoucherBatchType>>(url)
  },
  getVoucherDicount: (params?: VoucherQueryParams) => {
    const queryParams = new URLSearchParams()
    if (params?.index) queryParams.append('index', params.index.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.codeSearch) queryParams.append('codeSearch', params.codeSearch)
    const queryString = queryParams.toString()
    const url = queryString ? `/voucher-discount?${queryString}` : '/voucher-discount'
    return api.get<ListBaseResponse<VoucherDiscountType>>(url)
  },
  createVoucherBatch: (data: VoucherBatchFormData) => {
    return api.post<ItemBaseResponse<[]>>('/voucher-batch', data)
  },
  deletedVoucherBatch: (id: string) => {
    return api.delete<ItemBaseResponse<[]>>(`/voucher-batch/${id}`)
  }
}

export default manageVoucherApi
