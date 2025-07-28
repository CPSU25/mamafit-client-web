import { AddressType } from '@/@types/global.types'
import { ItemBaseResponse } from '@/@types/response'
import { api } from '@/lib/axios/axios'

const globalAPI = {
  getAddress: (id: string) => api.get<ItemBaseResponse<AddressType>>(`/address/${id}`)
}

export default globalAPI
