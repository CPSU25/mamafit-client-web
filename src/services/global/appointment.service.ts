import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentApi } from '@/apis/appointment.api'
import {
  AppointmentFilters,
  CreateAppointmentData,
  UpdateAppointmentData,
  Appointment,
  AppointmentStatus,
  AppointmentStats
} from '@/@types/apointment.type'
import { ErrorType } from '@/@types/response'
import { toast } from 'sonner'

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: AppointmentFilters) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const
}

// Hook để lấy danh sách lịch hẹn
export const useAppointments = (pageNumber: number = 1, pageSize: number = 10, filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: appointmentKeys.list({ ...filters }),
    queryFn: () => {
      const params = {
        pageNumber,
        pageSize,
        status: filters?.status,
        date: filters?.date ? filters.date.toISOString().split('T')[0] : undefined, // Format YYYY-MM-DD
        searchTerm: filters?.searchTerm,
        branchId: filters?.branchId
      }

      console.log('🌐 API Call Params:', params)

      return appointmentApi.getAppointments(params)
    },
    staleTime: 5 * 60 * 1000 // 5 phút
  })
}

// Hook để lấy chi tiết lịch hẹn
export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentApi.getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  })
}

// Hook để tính toán thống kê từ danh sách appointments
export const useAppointmentStats = (appointments: Appointment[]): AppointmentStats => {
  const stats: AppointmentStats = {
    totalAppointments: appointments.length,
    upComing: appointments.filter((apt) => apt.status === AppointmentStatus.UP_COMING).length,
    inProgress: appointments.filter((apt) => apt.status === AppointmentStatus.IN_PROGRESS).length,
    completed: appointments.filter((apt) => apt.status === AppointmentStatus.COMPLETED).length,
    canceled: appointments.filter((apt) => apt.status === AppointmentStatus.CANCELED).length
  }

  return stats
}

// Hook để tạo lịch hẹn mới
export const useCreateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentApi.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      toast.success('Tạo lịch hẹn thành công!')
    },
    onError: (error: ErrorType) => {
      toast.error(error?.response?.data?.errorMessage || 'Có lỗi xảy ra khi tạo lịch hẹn')
    }
  })
}

// Hook để cập nhật lịch hẹn
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) =>
      appointmentApi.updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      toast.success('Cập nhật lịch hẹn thành công!')
    },
    onError: (error: ErrorType) => {
      toast.error(error?.response?.data?.errorMessage || 'Có lỗi xảy ra khi cập nhật lịch hẹn')
    }
  })
}

// Hook để check-in lịch hẹn
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentApi.checkInAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      toast.success('Check-in thành công!')
    },
    onError: (error: ErrorType) => {
      toast.error(error?.response?.data?.errorMessage || 'Có lỗi xảy ra khi check-in')
    }
  })
}

// Hook để check-out lịch hẹn
export const useCheckOutAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentApi.checkOutAppointment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      toast.success('Check-out thành công!')
    },
    onError: (error: ErrorType) => {
      toast.error(error?.response?.data?.errorMessage || 'Có lỗi xảy ra khi check-out')
    }
  })
}

// Hook để hủy lịch hẹn
export const useCancelAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => appointmentApi.cancelAppointment(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      toast.success('Hủy lịch hẹn thành công!')
    },
    onError: (error: ErrorType) => {
      toast.error(error?.response?.data?.errorMessage || 'Có lỗi xảy ra khi hủy lịch hẹn')
    }
  })
}

// Hook để xóa lịch hẹn
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => appointmentApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      toast.success('Xóa lịch hẹn thành công!')
    },
    onError: (error: ErrorType) => {
      toast.error(error?.response?.data?.errorMessage || 'Có lỗi xảy ra khi xóa lịch hẹn')
    }
  })
}
