import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryFormData, StyleFormData } from '@/@types/manage-maternity-dress.types'
import categoryAPI from '@/apis/category.api'
import { styleAPI } from '@/apis'
import { toast } from 'sonner'

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
  stylesList: (categoryId: string, params: StyleQueryParams) =>
    [...categoryKeys.all, 'styles', categoryId, 'list', params] as const
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
      toast.success('Tạo danh mục thành công!')
    },
    onError: (error) => {
      console.error('Create category error:', error)
      toast.error('Tạo danh mục thất bại!')
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

      toast.success('Cập nhật danh mục thành công!')
    },
    onError: (error) => {
      console.error('Update category error:', error)
      toast.error('Cập nhật danh mục thất bại!')
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
    onSuccess: (_, deletedId) => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })

      // Remove deleted category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) })
      queryClient.removeQueries({ queryKey: categoryKeys.styles(deletedId) })

      toast.success('Xóa danh mục thành công!')
    },
    onError: (error) => {
      console.error('Delete category error:', error)
      toast.error('Xóa danh mục thất bại!')
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

//-------Style--------
// Get Styles
export const useGetStyles = (params?: StyleQueryParams) => {
  return useQuery({
    queryKey: ['styles', 'list', params || {}],
    queryFn: async () => {
      const response = await styleAPI.getStyles(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      toast.error(response.data.message || 'Failed to fetch style')
    }
  })
}
//Get Style by Id
export const useGetStyleById = (id: string) => {
  return useQuery({
    queryKey: ['style', id],
    enabled: !!id,
    queryFn: async () => {
      const response = await styleAPI.getStyleById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      toast.error(response.data.message || 'Failed to fetch style')
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
    onSuccess: (_, variables) => {
      // Invalidate styles for the specific category
      queryClient.invalidateQueries({
        queryKey: categoryKeys.styles(variables.categoryId)
      })

      // Also invalidate category lists in case style count affects display
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })

      toast.success('Tạo kiểu dáng thành công!')
    },
    onError: (error) => {
      console.error('Create style error:', error)
      toast.error('Tạo kiểu dáng thất bại!')
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
//Update style
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
    onSuccess: (data, variables) => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })

      // Update specific category detail if exists
      queryClient.setQueryData(categoryKeys.detail(variables.id), data)

      toast.success('Cập nhật danh mục thành công!')
    },
    onError: (error) => {
      console.error('Update category error:', error)
      toast.error('Cập nhật danh mục thất bại!')
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

      toast.success('Xóa kiểu dáng thành công!')
    },
    onError: (error) => {
      console.error('Delete style error:', error)
      toast.error('Xóa kiểu dáng thất bại!')
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
