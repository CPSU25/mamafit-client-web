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
const globalAPI = {
  getCurrentSequence: (orderItemId: string) =>
    api.get<ItemBaseResponse<number>>(`/order-items/current-sequence/${orderItemId}`),
  getAddress: (id: string) => api.get<ItemBaseResponse<AddressType>>(`/address/${id}`),
  getShippingFee: (query: ShippingFeeQuery) => api.get<ShippingFeeResponse>(`/ghtk-fee`, { params: query })
}

export default globalAPI
