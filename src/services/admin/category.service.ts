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

export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: CategoryQueryParams) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  styles: (categoryId: string) => [...categoryKeys.all, 'styles', categoryId] as const,
  stylesList: (categoryId: string, params: StyleQueryParams) =>
    [...categoryKeys.all, 'styles', categoryId, 'list', params] as const
}

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
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

export const useStylesByCategory = (categoryId: string, params?: StyleQueryParams) => {
  return useQuery({
    queryKey: categoryKeys.stylesList(categoryId, params || {}),
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })

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
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })

      queryClient.setQueryData(categoryKeys.detail(variables.id), data)

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

export const useGetStyles = (params?: StyleQueryParams) => {
  return useQuery({
    queryKey: ['styles', 'list', params || {}],
    queryFn: async () => {
      const response = await styleAPI.getStyles(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch styles')
    }
  })
}
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
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })

      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: categoryKeys.styles(deletedId) })

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.styles(variables.categoryId)
      })

      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
      queryClient.refetchQueries({
        queryKey: categoryKeys.stylesList(variables.categoryId, { index: 1, pageSize: 10, sortBy: 'createdAt_desc' })
      })
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
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
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
