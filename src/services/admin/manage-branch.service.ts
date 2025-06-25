import { BranchRequest } from '@/@types/branch.type'
import manageBranchAPI, { BranchQueryParams } from '@/apis/manage-branch.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params: BranchQueryParams) => [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const
}

export const useGetBranches = (params?: BranchQueryParams) => {
  return useQuery({
    queryKey: branchKeys.list(params || {}),
    queryFn: async () => {
      const response = await manageBranchAPI.getBranchs(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch branches')
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry on client errors (4xx)
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

export const useCreateBranch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: BranchRequest) => {
      const response = await manageBranchAPI.createBranch(body)
      // Accept both 200 and 201 status codes for successful creation
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create branch')
    },
    onSuccess: () => {
      // Only invalidate queries, let React Query handle the refetch automatically
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
    },
    onError: (error) => {
      console.error('❌ Create branch error:', error)
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}

export const useUpdateBranch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: BranchRequest & { id: string }) => {
      const response = await manageBranchAPI.updateBranch(body.id, body)
      // Accept both 200 and 204 status codes for successful update
      if (response.data.statusCode === 200 || response.data.statusCode === 204) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update branch')
    },
    onSuccess: () => {
      // Only invalidate queries, let React Query handle the refetch automatically
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
    },
    onError: (error) => {
      console.error('Update branch error:', error)
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}

export const useDeleteBranch = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await manageBranchAPI.deleteBranch(id)
      // Accept both 200 and 204 status codes for successful deletion
      if (response.data.statusCode === 200 || response.data.statusCode === 204) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete branch')
    },
    onSuccess: () => {
      // Only invalidate queries, let React Query handle the refetch automatically
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() })
    },
    onError: (error) => {
      console.error('Delete branch error:', error)
    },
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 2
    }
  })
}
