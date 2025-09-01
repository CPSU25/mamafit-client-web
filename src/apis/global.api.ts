import { AddressType } from '@/@types/global.types'
import { ItemBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

interface ShippingFeeQuery {
  Province: string
  District: string
  Weight: 500
}
interface ShippingFeeResponse {
  fee: {
    fee: number
  }
}
interface SequenceCurrentResponse{
  milestone: number 
  task: number
}
const globalAPI = {
  getCurrentSequence: (orderItemId: string) =>
    api.get<ItemBaseResponse<SequenceCurrentResponse>>(`/order-items/current-sequence/${orderItemId}`),
  getAddress: (id: string) => api.get<ItemBaseResponse<AddressType>>(`/address/${id}`),
  getShippingFee: (query: ShippingFeeQuery) => api.get<ShippingFeeResponse>(`/ghtk-fee`, { params: query })
}

export default globalAPI
