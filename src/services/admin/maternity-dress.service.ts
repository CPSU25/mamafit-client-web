import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { maternityDressAPI } from '@/apis'
import type { QueryKey } from '@tanstack/react-query'
import {
  MaternityDressDetail,
  MaternityDressDetailFormData,
  MaternityDressFormData,
  MaternityDressList,
  MaternityDressDetailType
} from '@/@types/inventory.type'
import type { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { toast } from 'sonner'

interface MaternityDressQueryParams {
  index?: number
  pageSize?: number
  search?: string
  sortBy?: string
}

// Query Keys
export const maternityDressKeys = {
  all: ['maternity-dress'] as const,

  // Maternity Dresses
  maternityDresses: () => [...maternityDressKeys.all, 'maternityDresses'] as const,
  maternityDressesList: (params: MaternityDressQueryParams) =>
    [...maternityDressKeys.maternityDresses(), 'list', params] as const,
  maternityDressDetail: (id: string) => [...maternityDressKeys.maternityDresses(), 'detail', id] as const,

  // Maternity Dresses Details
  maternityDressesDetails: () => [...maternityDressKeys.all, 'maternityDressesDetails'] as const,
  maternityDressesDetailsList: (params: MaternityDressQueryParams) =>
    [...maternityDressKeys.maternityDressesDetails(), 'list', params] as const,
  maternityDressesDetail: (id: string) => [...maternityDressKeys.maternityDressesDetails(), 'detail', id] as const
}

// Fetch Maternity Dresses with filters
export const useGetMaternityDresses = (params?: MaternityDressQueryParams) => {
  return useQuery({
    queryKey: maternityDressKeys.maternityDressesList(params || {}),
    queryFn: async () => {
      const response = await maternityDressAPI.getMaternityDresses(params)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch products')
    }
  })
}

export const useGetMaternityDressDetail = (id: string) => {
  return useQuery({
    queryKey: maternityDressKeys.maternityDressDetail(id),
    queryFn: async () => {
      const response = await maternityDressAPI.getMaternityDressById(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to fetch product')
    },
    enabled: !!id
  })
}

// Create Maternity Dress
export const useCreateMaternityDress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MaternityDressFormData) => {
      const response = await maternityDressAPI.createMaternityDress(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create product')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
      toast.success('Tạo sản phẩm thành công!')
    },
    onError: (error) => {
      console.error('Create maternity dress error:', error)
      toast.error('Tạo sản phẩm thất bại!')
    }
  })
}

// Update Maternity Dress
export const useUpdateMaternityDress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MaternityDressFormData }) => {
      const response = await maternityDressAPI.updateMaternityDress(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update product')
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
      queryClient.setQueryData(maternityDressKeys.maternityDressDetail(variables.id), data)
      toast.success('Cập nhật sản phẩm thành công!')
    },
    onError: (error) => {
      console.error('Update maternity dress error:', error)
      toast.error('Cập nhật sản phẩm thất bại!')
    }
  })
}

// Delete Maternity Dress
export const useDeleteMaternityDress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await maternityDressAPI.deleteMaternityDress(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete product')
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: maternityDressKeys.all })

      // Snapshot of affected lists to rollback if needed
      const affectedLists = queryClient.getQueriesData<ListBaseResponse<MaternityDressList>>({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'maternity-dress' &&
          query.queryKey[1] === 'maternityDresses' &&
          query.queryKey[2] === 'list'
      })
      const previous: { key: QueryKey; data: ListBaseResponse<MaternityDressList> | undefined }[] = affectedLists.map(
        ([key, data]) => ({ key: key as QueryKey, data })
      )

      // Optimistically remove item from lists
      affectedLists.forEach(([key, data]) => {
        if (!data || !data.data?.items) return
        const items = (data.data.items as MaternityDressList[]).filter((it) => it.id !== deletedId)
        const next = {
          ...data,
          data: {
            ...data.data,
            items,
            totalCount: Math.max((data.data.totalCount ?? items.length) - 1, 0)
          }
        }
        queryClient.setQueryData(key as QueryKey, next)
      })

      // Drop the detail cache immediately
      queryClient.removeQueries({ queryKey: maternityDressKeys.maternityDressDetail(deletedId) })

      return { previous }
    },
    onError: (error, _deletedId, context) => {
      // Rollback lists
      context?.previous?.forEach((entry) => queryClient.setQueryData(entry.key, entry.data))
      console.error('Delete maternity dress error:', error)
      toast.error('Xóa sản phẩm thất bại!')
    },
    onSuccess: () => {
      toast.success('Xóa sản phẩm thành công!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
    }
  })
}

// ===============================
// MATERNITY DRESSES DETAILS HOOKS
// ===============================

// Fetch Maternity Dresses Details
// export const useMaternityDressesDetails = (params?: MaternityDressDetailQueryParams) => {
//   return useQuery({
//     queryKey: maternityDressKeys.maternityDressesDetailsList(params || {}),
//     queryFn: async () => {
//       const response = await maternityDressAPI.getMaternityDressDetails(params)
//       if (response.data.statusCode === 200) {
//         return response.data
//       }
//       throw new Error(response.data.message || 'Failed to fetch maternity dresses')
//     },
//   })
// }

// Fetch Single Maternity Dress
// export const useGetMaternityDressDetail = (id: string) => {
//   return useQuery({
//     queryKey: maternityDressKeys.maternityDressDetail(id),
//     queryFn: async () => {
//       const response = await maternityDressAPI.getMaternityDressDetailById(id)
//       if (response.data.statusCode === 200) {
//         return response.data
//       }
//       throw new Error(response.data.message || 'Failed to fetch maternity dress')
//     },
//     enabled: !!id,
//   })
// }

// Create Maternity Dress
export const useCreateMaternityDressDetail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MaternityDressDetailFormData) => {
      const response = await maternityDressAPI.createMaternityDressDetail(data)
      if (response.data.statusCode === 200 || response.data.statusCode === 201) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to create maternity dress')
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: maternityDressKeys.maternityDressDetail(variables.maternityDressId)
      })
      const key = maternityDressKeys.maternityDressDetail(variables.maternityDressId)
      const previous = queryClient.getQueryData<ItemBaseResponse<MaternityDressDetail>>(key)

      if (previous?.data) {
        const optimistic = {
          id: `temp-${Date.now()}`,
          name: variables.name,
          description: variables.description,
          images: variables.images,
          color: variables.color,
          size: variables.size,
          quantity: variables.quantity,
          price: variables.price
        }
        const next = {
          ...previous,
          data: { ...previous.data, details: [...(previous.data.details || []), optimistic] }
        }
        queryClient.setQueryData(key, next)
      }
      return { key, previous }
    },
    onError: (error, _variables, context) => {
      if (context?.key) queryClient.setQueryData(context.key, context.previous)
      console.error('Create maternity dress detail error:', error)
      toast.error('Tạo chi tiết sản phẩm thất bại!')
    },
    onSuccess: (_, variables) => {
      toast.success('Tạo chi tiết sản phẩm thành công!')
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.maternityDressDetail(variables.maternityDressId) })
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
    }
  })
}

// Update Maternity Dress Detail
export const useUpdateMaternityDressDetail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MaternityDressDetailFormData }) => {
      const response = await maternityDressAPI.updateMaternityDressDetail(id, data)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to update maternity dress')
    },
    onSuccess: (_, variables) => {
      // Invalidate the detail query for the specific maternity dress
      queryClient.invalidateQueries({
        queryKey: maternityDressKeys.maternityDressDetail(variables.data.maternityDressId)
      })
      // Also invalidate the list
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
      toast.success('Cập nhật chi tiết sản phẩm thành công!')
    },
    onError: (error) => {
      console.error('Update maternity dress detail error:', error)
      toast.error('Cập nhật chi tiết sản phẩm thất bại!')
    }
  })
}

// Delete Maternity Dress Detail
export const useDeleteMaternityDressDetail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await maternityDressAPI.deleteMaternityDressDetail(id)
      if (response.data.statusCode === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to delete maternity dress')
    },
    onMutate: async (detailId) => {
      await queryClient.cancelQueries({ queryKey: maternityDressKeys.all })

      const affected = queryClient.getQueriesData<ItemBaseResponse<MaternityDressDetail>>({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'maternity-dress' &&
          query.queryKey[1] === 'maternityDresses' &&
          query.queryKey[2] === 'detail'
      })
      const previous: { key: QueryKey; data: ItemBaseResponse<MaternityDressDetail> | undefined }[] = affected.map(
        ([key, data]) => ({ key: key as QueryKey, data })
      )

      affected.forEach(([key, data]) => {
        if (!data || !data.data?.details) return
        const nextDetails = (data.data.details as MaternityDressDetailType[]).filter((d) => d.id !== detailId)
        const next = { ...data, data: { ...data.data, details: nextDetails } }
        queryClient.setQueryData(key as QueryKey, next)
      })

      return { previous }
    },
    onError: (error, _id, context) => {
      context?.previous?.forEach((entry) => queryClient.setQueryData(entry.key, entry.data))
      console.error('Delete maternity dress detail error:', error)
      toast.error('Xóa chi tiết sản phẩm thất bại!')
    },
    onSuccess: () => {
      toast.success('Xóa chi tiết sản phẩm thành công!')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: maternityDressKeys.all })
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'maternity-dress'
      })
    }
  })
}
