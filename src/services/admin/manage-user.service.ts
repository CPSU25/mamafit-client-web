import manageUserAPI, { CreateUserData, CreateSystemAccountData } from '@/apis/manage-user.api'
import { ManageUserType } from '@/@types/admin.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface ManageUserQueryParams {
  index?: number
  pageSize?: number
  nameSearch?: string
  roleName?: string
}

// Query Keys
export const manageUserKeys = {
  all: ['manage-user'] as const,
  list: (params: ManageUserQueryParams) => [...manageUserKeys.all, 'list', params] as const,
  detail: (id: string) => [...manageUserKeys.all, 'detail', id] as const,
  delete: (id: string) => [...manageUserKeys.all, 'delete', id] as const,
  update: (id: string) => [...manageUserKeys.all, 'update', id] as const,
  create: () => [...manageUserKeys.all, 'create'] as const,
  createSystemAccount: () => [...manageUserKeys.all, 'create-system-account'] as const,
  getRoles: () => [...manageUserKeys.all, 'get-roles'] as const
}

export const useGetListUser = (params?: ManageUserQueryParams) => {
  return useQuery({
    queryKey: manageUserKeys.list(params || {}),
    queryFn: async () => {
      const response = await manageUserAPI.getListUser(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch users')
    },
    staleTime: 5 * 60 * 1000
  })
}

export const useGetUserById = (id: string) => {
  return useQuery({
    queryKey: manageUserKeys.detail(id),
    queryFn: async () => {
      const response = await manageUserAPI.getUserById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch user')
    }
  })
}

// New hook for creating system account
export const useCreateSystemAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateSystemAccountData) => {
      const response = await manageUserAPI.createSystemAccount(data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create system account')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageUserKeys.list({}) })
    }
  })
}
export const useGetRoles = () => {
  return useQuery({
    queryKey: manageUserKeys.getRoles(),
    queryFn: async () => {
      const response = await manageUserAPI.getRoles()
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch roles')
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  })
}

// Keep old hook for backward compatibility
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await manageUserAPI.createUser(data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create user')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageUserKeys.list({}) })
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await manageUserAPI.deleteUser(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete user')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageUserKeys.list({}) })
    }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ManageUserType }) => {
      const response = await manageUserAPI.updateUser(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update user')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageUserKeys.list({}) })
    }
  })
}
