import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MilestoneFormData, TaskFormData } from '@/@types/admin.types'
import ManageMilestoneAPI, { MilestoneQueryParams } from '@/apis/manage-milestone.api'
import { toast } from 'sonner'

// Query Keys
export const milestoneKeys = {
  all: ['milestones'] as const,
  lists: () => [...milestoneKeys.all, 'list'] as const,
  list: (params: MilestoneQueryParams) => [...milestoneKeys.lists(), params] as const,
  details: () => [...milestoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...milestoneKeys.details(), id] as const
}

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: MilestoneQueryParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const
}

// Fetch Milestones
export const useMilestones = (params?: MilestoneQueryParams) => {
  return useQuery({
    queryKey: milestoneKeys.list(params || {}),
    queryFn: async () => {
      const response = await ManageMilestoneAPI.getMilestones(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch milestones')
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

//Get Milestone detail by id
export const useMilestone = (id: string) => {
  return useQuery({
    queryKey: milestoneKeys.detail(id),
    queryFn: async () => {
      const response = await ManageMilestoneAPI.getMilestoneById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch milestone')
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

// Create Milestone
export const useCreateMilestone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MilestoneFormData) => {
      const response = await ManageMilestoneAPI.createMilestone(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create milestone')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all })
      toast.success('Tạo mốc thời gian thành công!')
    },
    onError: (error) => {
      console.error('Create milestone error:', error)
      toast.error('Tạo mốc thời gian thất bại!')
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

// Update Milestone
export const useUpdateMilestone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MilestoneFormData }) => {
      const response = await ManageMilestoneAPI.updateMilestone(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update milestone')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all })
      queryClient.setQueryData(milestoneKeys.detail(variables.id), data)
      toast.success('Cập nhật mốc thời gian thành công!')
    },
    onError: (error) => {
      console.error('Update milestone error:', error)
      toast.error('Cập nhật mốc thời gian thất bại!')
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

// Delete Milestone
export const useDeleteMilestone = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ManageMilestoneAPI.deleteMilestone(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete milestone')
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all })
      queryClient.removeQueries({ queryKey: milestoneKeys.detail(deletedId) })
      toast.success('Xóa mốc thời gian thành công!')
    },
    onError: (error) => {
      console.error('Delete milestone error:', error)
      toast.error('Xóa mốc thời gian thất bại!')
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

// Fetch Tasks
export const useTasks = (params?: MilestoneQueryParams) => {
  return useQuery({
    queryKey: taskKeys.list(params || {}),
    queryFn: async () => {
      const response = await ManageMilestoneAPI.getTasks(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch tasks')
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

//Get Task detail by id
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: async () => {
      const response = await ManageMilestoneAPI.getTaskById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch task')
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

// Create Task
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await ManageMilestoneAPI.createTask(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create task')
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.detail(data.milestoneId) })
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success('Tạo nhiệm vụ thành công!')
    },
    onError: (error) => {
      console.error('Create task error:', error)
      toast.error('Tạo nhiệm vụ thất bại!')
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

// Update Task
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TaskFormData }) => {
      const response = await ManageMilestoneAPI.updateTask(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update task')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all })
      queryClient.setQueryData(taskKeys.detail(variables.id), data)
      toast.success('Cập nhật nhiệm vụ thành công!')
    },
    onError: (error) => {
      console.error('Update task error:', error)
      toast.error('Cập nhật nhiệm vụ thất bại!')
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

// Delete Task
export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ManageMilestoneAPI.deleteTask(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete task')
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      queryClient.invalidateQueries({ queryKey: milestoneKeys.all })
      queryClient.removeQueries({ queryKey: taskKeys.detail(deletedId) })
      toast.success('Xóa nhiệm vụ thành công!')
    },
    onError: (error) => {
      console.error('Delete task error:', error)
      toast.error('Xóa nhiệm vụ thất bại!')
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

export const useGetStatusTimelineOfOrderItem = (orderItemId: string) => {
  return useQuery({
    queryKey: ['status-timeline-of-order-item', orderItemId],
    queryFn: async () => {
      const response = await ManageMilestoneAPI.getStatusTimelineOfOrderItem(orderItemId)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch status timeline of order item')
    },
    enabled: !!orderItemId
  })
}
