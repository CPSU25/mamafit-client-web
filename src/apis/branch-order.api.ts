import { BranchOrderType, BranchResponse } from '@/@types/branch-order.types'
import { api } from '@/lib/axios/axios'

const branchOrderAPI = {
  getBranchOrders: () => api.get<BranchResponse<BranchOrderType>>(`/order/branch-manager-orders`),
  receiveAtBranch: (orderId: string) => api.put<BranchResponse<[]>>(`/order/${orderId}/receivedAtBranch`),
  completeOrder: (orderId: string) => api.put<BranchResponse<[]>>(`/order/${orderId}/completeAtBranch`)
}

export default branchOrderAPI
