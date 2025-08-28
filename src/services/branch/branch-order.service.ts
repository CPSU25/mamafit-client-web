import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import branchOrderAPI from '@/apis/branch-order.api'

export const useGetBranchOrders = () => {
  return useQuery({
    queryKey: ['branch-orders'],
    queryFn: branchOrderAPI.getBranchOrders,
    select: (data) => data.data
  })
}

export const useReceiveAtBranch = (orderId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => branchOrderAPI.receiveAtBranch(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-orders'] })
    }
  })
}

export const useCompleteOrder = (orderId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => branchOrderAPI.completeOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-orders'] })
    }
  })
}
