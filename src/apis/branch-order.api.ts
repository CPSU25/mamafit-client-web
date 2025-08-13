import { BranchOrderType, BranchResponse } from '@/@types/branch-order.types'
import { api } from '@/lib/axios/axios'

const branchOrderAPI = {
  getBranchOrders: () => api.get<BranchResponse<BranchOrderType>>(`/order/branch-manager-orders`),

}

export default branchOrderAPI
