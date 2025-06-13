import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { styleAPI } from '@/apis'
import { StyleFormData } from '@/@types/inventory.type'

interface StyleQueryParams {
  index?: number
  pageSize?: number
  sortBy?: string
  search?: string
}

// Query Keys
export const styleKeys = {
  all: ['styles'] as const,
  lists: () => [...styleKeys.all, 'list'] as const,
  list: (params: StyleQueryParams) => [...styleKeys.lists(), params] as const,
  details: () => [...styleKeys.all, 'detail'] as const,
  detail: (id: string) => [...styleKeys.details(), id] as const
}

// ===============================
// STYLES HOOKS
// ===============================

// Fetch Styles with filters
export const useGetStyles = (params?: StyleQueryParams) => {
  return useQuery({
    queryKey: styleKeys.list(params || {}),
    queryFn: async () => {
      const response = await styleAPI.getStyles(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch styles')
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Fetch Single Style
export const useGetStyleById = (id: string) => {
  return useQuery({
    queryKey: styleKeys.detail(id),
    queryFn: async () => {
      const response = await styleAPI.getStyleById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch style')
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}

// Create Style
export const useCreateStyle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StyleFormData) => {
      const response = await styleAPI.createStyle(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create style')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: styleKeys.all })
    },
    retry: (failureCount, error: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Update Style
export const useUpdateStyle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StyleFormData }) => {
      const response = await styleAPI.updateStyle(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update style')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: styleKeys.all })
    },
    retry: (failureCount, error: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Delete Style
export const useDeleteStyle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await styleAPI.deleteStyle(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete style')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: styleKeys.all })
    },
    retry: (failureCount, error: any) => {
      // eslint-disable-line @typescript-eslint/no-explicit-any
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}
