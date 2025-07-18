import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ComponentTypeFormData, ComponentOptionType, ComponentOptionFormData } from '@/@types/admin.types'
import ManageComponentAPI from '@/apis/manage-component.api'

interface ComponentQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

// Query Keys
export const componentKeys = {
  all: ['components'] as const,
  lists: () => [...componentKeys.all, 'list'] as const,
  list: (params: ComponentQueryParams) => [...componentKeys.lists(), params] as const,
  details: () => [...componentKeys.all, 'detail'] as const,
  detail: (id: string) => [...componentKeys.details(), id] as const
}

// Fetch Components
export const useComponents = (params?: ComponentQueryParams) => {
  return useQuery({
    queryKey: componentKeys.list(params || {}),
    queryFn: async () => {
      const response = await ManageComponentAPI.getComponents(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch components')
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

//Get Component detail by id
export const useComponent = (id: string) => {
  return useQuery({
    queryKey: componentKeys.detail(id),
    queryFn: async () => {
      const response = await ManageComponentAPI.getComponentById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch component')
    },
    enabled: !!id,
    retry: (failureCount, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status && status >= 400 && status < 500) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Create Component
export const useCreateComponent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ComponentTypeFormData) => {
      const response = await ManageComponentAPI.createComponent(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create component')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() })
      queryClient.refetchQueries({ queryKey: componentKeys.list({}) })
    },
    onError: (error) => {
      console.error('Create component error:', error)
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

// Update Component
export const useUpdateComponent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ComponentTypeFormData }) => {
      const response = await ManageComponentAPI.updateComponent(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update component')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: componentKeys.all })
      queryClient.setQueryData(componentKeys.detail(variables.id), data)
      queryClient.refetchQueries({ queryKey: componentKeys.lists() })
    },
    onError: (error) => {
      console.error('Update component error:', error)
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

// Delete Component
export const useDeleteComponent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ManageComponentAPI.deleteComponent(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete component')
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: componentKeys.all })
      queryClient.removeQueries({ queryKey: componentKeys.detail(deletedId) })
      queryClient.refetchQueries({ queryKey: componentKeys.lists() })
    },
    onError: (error) => {
      console.error('Delete component error:', error)
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

// Create Component Option
export const useCreateComponentOption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ComponentOptionFormData) => {
      const response = await ManageComponentAPI.createComponentOption(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create component option')
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: componentKeys.detail(data.componentId) })
      queryClient.refetchQueries({ queryKey: componentKeys.details() })
    },
    onError: (error) => {
      console.error('Create component option error:', error)
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

// Update Component Option
export const useUpdateComponentOption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ componentOptionId, data }: { componentOptionId: string; data: ComponentOptionType }) => {
      const response = await ManageComponentAPI.updateComponentOption(componentOptionId, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update component option')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: componentKeys.lists() })
      queryClient.refetchQueries({ queryKey: componentKeys.list({}) })
    },
    onError: (error) => {
      console.error('Update component option error:', error)
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

// Delete Component Option
export const useDeleteComponentOption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (componentOptionId: string) => {
      const response = await ManageComponentAPI.deleteComponentOption(componentOptionId)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete component option')
    },
    onSuccess: (_, componentOptionId) => {
      queryClient.invalidateQueries({ queryKey: componentKeys.detail(componentOptionId) })
      queryClient.refetchQueries({ queryKey: componentKeys.details() })
    },
    onError: (error) => {
      console.error('Delete component option error:', error)
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
