import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import branchMaternityDressAPI from '@/apis/branch-maternity-dress.api'
import { BranchMaternityDressDetailForm } from '@/@types/branch-maternity-dress.types'

// Query key constants
export const BRANCH_MATERNITY_DRESS_QUERY_KEYS = {
  all: () => ['branch-maternity-dress'] as const,
  list: () => [...BRANCH_MATERNITY_DRESS_QUERY_KEYS.all(), 'list'] as const
}

// Hook để lấy danh sách phân bổ chi nhánh
export const useGetBranchMaternityDresses = () => {
  return useQuery({
    queryKey: BRANCH_MATERNITY_DRESS_QUERY_KEYS.list(),
    queryFn: () => branchMaternityDressAPI.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

// Hook để phân bổ số lượng cho chi nhánh
export const useAssignQuantityForBranch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BranchMaternityDressDetailForm) => branchMaternityDressAPI.assignQuantityForBranch(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: BRANCH_MATERNITY_DRESS_QUERY_KEYS.all()
      })
      queryClient.invalidateQueries({
        queryKey: ['maternity-dress-detail']
      })
      queryClient.invalidateQueries({
        queryKey: ['maternity-dresses']
      })
    }
  })
}
