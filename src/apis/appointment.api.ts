import { api } from '@/lib/axios/axios'
import { Appointment, CreateAppointmentData, UpdateAppointmentData } from '@/@types/apointment.type'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'

export const appointmentApi = {
  // Lấy danh sách lịch hẹn với phân trang và bộ lọc
  getAppointments: async (params?: {
    pageNumber?: number
    pageSize?: number
    status?: string
    date?: string
    searchTerm?: string
    branchId?: string
  }): Promise<ListBaseResponse<Appointment>> => {
    const response = await api.get('/appointment', { params })
    return response.data
  },

  // Lấy chi tiết một lịch hẹn
  getAppointmentById: async (id: string): Promise<ItemBaseResponse<Appointment>> => {
    const response = await api.get(`/appointment/${id}`)
    return response.data
  },

  // Tạo lịch hẹn mới
  createAppointment: async (data: CreateAppointmentData): Promise<ItemBaseResponse<Appointment>> => {
    const response = await api.post('/appointment', data)
    return response.data
  },

  // Cập nhật lịch hẹn
  updateAppointment: async (id: string, data: UpdateAppointmentData): Promise<ItemBaseResponse<Appointment>> => {
    const response = await api.put(`/appointment/${id}`, data)
    return response.data
  },

  // Check-in lịch hẹn
  checkInAppointment: async (id: string): Promise<ItemBaseResponse<Appointment>> => {
    const response = await api.put(`/appointment/${id}/check-in`)
    return response.data
  },

  // Check-out lịch hẹn
  checkOutAppointment: async (id: string): Promise<ItemBaseResponse<Appointment>> => {
    const response = await api.put(`/appointment/${id}/check-out`)
    return response.data
  },

  // Hủy lịch hẹn
  cancelAppointment: async (id: string, reason?: string): Promise<ItemBaseResponse<Appointment>> => {
    const response = await api.put(`/appointment/${id}/cancel`, { canceledReason: reason })
    return response.data
  },

  // Xóa lịch hẹn
  deleteAppointment: async (id: string): Promise<ItemBaseResponse<void>> => {
    const response = await api.delete(`/appointment/${id}`)
    return response.data
  }
}
