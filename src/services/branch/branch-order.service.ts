import { useQuery } from "@tanstack/react-query"
import branchOrderAPI from "@/apis/branch-order.api"

export const useGetBranchOrders = () => {
    return useQuery({
        queryKey: ['branch-orders'],
        queryFn: branchOrderAPI.getBranchOrders,
        select: (data) => data.data,
    })
}