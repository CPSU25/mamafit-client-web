import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryFormData, StyleFormData } from '@/@types/inventory.type'
import categoryAPI from '@/apis/category.api'
import { styleAPI } from '@/apis'

interface CategoryQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

interface StyleQueryParams {
  index?: number
  pageSize?: number
  sortBy?: string
}

// Query Keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: CategoryQueryParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  styles: (categoryId: string) => [...categoryKeys.all, 'styles', categoryId] as const,
  stylesList: (params: StyleQueryParams) => [...categoryKeys.all, 'styles', 'list', params] as const
}

// Fetch Categories
export const useCategories = (params?: CategoryQueryParams) => {
  return useQuery({
    queryKey: categoryKeys.list(params || {}),
    queryFn: async () => {
      const response = await categoryAPI.getCategories(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch categories')
    },
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

// Fetch Styles by Category
export const useStylesByCategory = (categoryId: string, params?: StyleQueryParams) => {
  return useQuery({
    queryKey: categoryKeys.stylesList(params || {}),
    queryFn: async () => {
      const response = await categoryAPI.getStylesByCategory(categoryId, params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch styles')
    },
    enabled: !!categoryId, // Only run query if categoryId exists
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Create Category
export const useCreateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await categoryAPI.createCategory(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create category')
    },
    onSuccess: () => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      
      // Force refetch for better UX
      queryClient.refetchQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error) => {
      console.error('Create category error:', error)
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

// Update Category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const response = await categoryAPI.updateCategory(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update category')
    },
    onSuccess: (data, variables) => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      
      // Update specific category detail if exists
      queryClient.setQueryData(categoryKeys.detail(variables.id), data)
      
      // Force refetch for better UX
      queryClient.refetchQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error) => {
      console.error('Update category error:', error)
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

// Get Styles
export const useGetStyles = (params?: StyleQueryParams) => {
  return useQuery({
    queryKey: categoryKeys.stylesList(params || {}),
    queryFn: async () => {
      const response = await styleAPI.getStyles(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch styles')
    }
  })
}
// Delete Category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryAPI.deleteCategory(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete category')
    },
    onSuccess: (data, deletedId) => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      
      // Remove deleted category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: categoryKeys.styles(deletedId) })
      
      // Force refetch for immediate UI update
      queryClient.refetchQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error) => {
      console.error('Delete category error:', error)
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

// Create Style
export const useCreateStyle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StyleFormData) => {
      const response = await categoryAPI.createStyle(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create style')
    },
    onSuccess: (data, variables) => {
      // Invalidate styles for the specific category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.styles(variables.categoryId)
      })
      
      // Also invalidate category lists in case style count affects display
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error) => {
      console.error('Create style error:', error)
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

// Delete Style
export const useDeleteStyle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryAPI.deleteStyle(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete style')
    },
    onSuccess: () => {
      // Comprehensive invalidation since we don't know which category the style belonged to
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
      
      // Force refetch for immediate UI update
      queryClient.refetchQueries({ queryKey: categoryKeys.lists() })
    },
    onError: (error) => {
      console.error('Delete style error:', error)
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