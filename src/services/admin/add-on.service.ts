import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import addOnAPI, { AddOnQueryParams } from '@/apis/add-on.api'
import { toast } from 'sonner'
import { AddOnForm, AddOnOptionForm, PositionForm, SizeForm } from '@/@types/add-on.types'

// Add-on hooks
export const useGetAddOns = (params?: { index?: number; pageSize?: number; search?: string; sortBy?: string }) => {
  return useQuery({
    queryKey: ['add-ons', params],
    queryFn: () => addOnAPI.getAddOns(params as AddOnQueryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  })
}

export const useGetAddOnById = (id: string) => {
  return useQuery({
    queryKey: ['add-on', id],
    queryFn: () => addOnAPI.getAddOnById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

export const useCreateAddOn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddOnForm) => addOnAPI.createAddOn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['add-ons'] })
      toast.success('Tạo add-on thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error creating add-on:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo add-on'
      toast.error(errorMessage)
    }
  })
}

export const useUpdateAddOn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddOnForm }) => addOnAPI.updateAddOn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['add-ons'] })
      toast.success('Cập nhật add-on thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error updating add-on:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật add-on'
      toast.error(errorMessage)
    }
  })
}

export const useDeleteAddOn = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => addOnAPI.deleteAddOn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['add-ons'] })
      toast.success('Xóa add-on thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error deleting add-on:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa add-on'
      toast.error(errorMessage)
    }
  })
}

// Add-on Option hooks
export const useGetAddOnOptions = (addOnId: string) => {
  return useQuery({
    queryKey: ['add-on-options', addOnId],
    queryFn: () => addOnAPI.getAddOnOptions(addOnId),
    enabled: !!addOnId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

export const useCreateAddOnOption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddOnOptionForm) => addOnAPI.createAddOnOption(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['add-on-options', variables.addOnId] })
      queryClient.invalidateQueries({ queryKey: ['add-ons'] })
      toast.success('Tạo add-on option thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error creating add-on option:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo add-on option'
      toast.error(errorMessage)
    }
  })
}

export const useUpdateAddOnOption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddOnOptionForm }) => addOnAPI.updateAddOnOption(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['add-on-options', variables.data.addOnId] })
      queryClient.invalidateQueries({ queryKey: ['add-ons'] })
      toast.success('Cập nhật add-on option thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error updating add-on option:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật add-on option'
      toast.error(errorMessage)
    }
  })
}

export const useDeleteAddOnOption = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => addOnAPI.deleteAddOnOption(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['add-on-options'] })
      queryClient.invalidateQueries({ queryKey: ['add-ons'] })
      toast.success('Xóa add-on option thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error deleting add-on option:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa add-on option'
      toast.error(errorMessage)
    }
  })
}

// Position hooks
export const useGetPositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => addOnAPI.getPositions(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000 // 20 minutes
  })
}

export const useCreatePosition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PositionForm) => addOnAPI.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      toast.success('Tạo position thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error creating position:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo position'
      toast.error(errorMessage)
    }
  })
}

export const useUpdatePosition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PositionForm }) => addOnAPI.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      toast.success('Cập nhật position thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error updating position:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật position'
      toast.error(errorMessage)
    }
  })
}

export const useDeletePosition = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => addOnAPI.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] })
      toast.success('Xóa position thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error deleting position:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa position'
      toast.error(errorMessage)
    }
  })
}

// Size hooks
export const useGetSizes = () => {
  return useQuery({
    queryKey: ['sizes'],
    queryFn: () => addOnAPI.getSizes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000 // 20 minutes
  })
}

export const useCreateSize = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SizeForm) => addOnAPI.createSize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] })
      toast.success('Tạo size thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error creating size:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo size'
      toast.error(errorMessage)
    }
  })
}

export const useUpdateSize = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SizeForm }) => addOnAPI.updateSize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] })
      toast.success('Cập nhật size thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error updating size:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật size'
      toast.error(errorMessage)
    }
  })
}

export const useDeleteSize = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => addOnAPI.deleteSize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizes'] })
      toast.success('Xóa size thành công!')
    },
    onError: (error: unknown) => {
      console.error('Error deleting size:', error)
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa size'
      toast.error(errorMessage)
    }
  })
}
