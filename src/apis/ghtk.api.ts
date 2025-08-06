import { api } from '@/lib/axios/axios'
import { GHTKCreateShippingResponse } from '@/@types/ghtk.types'

const ghtkAPI = {
  createShipping: (orderId: string): Promise<{ data: GHTKCreateShippingResponse }> =>
    api.post(`/ghtk-submit-order/${orderId}`)
}

export default ghtkAPI
