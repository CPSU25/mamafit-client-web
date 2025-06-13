import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryFormData, StyleFormData } from '@/@types/inventory.type'
import categoryAPI from '@/apis/category.api'


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
    [...categoryKeys.styles(categoryId), 'list', params] as const,
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
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
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
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
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
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
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
    },
  })
} 