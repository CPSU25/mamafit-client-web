import { api } from '@/lib/axios/axios'
import { GHTKCreateShippingResponse } from '@/@types/ghtk.types'

const ghtkAPI = {
  createShipping: (orderId: string): Promise<{ data: GHTKCreateShippingResponse }> =>
    api.post(`/ghtk-create-cancel-order/${orderId}`)
}

export default ghtkAPI
