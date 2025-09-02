import { api } from '@/lib/axios/axios'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { NotificationResponseDto } from '@/services/notification/notification-signalr.service'

// ===== NOTIFICATION API TYPES =====
export interface GetNotificationsRequest {
  pageNumber?: number
  pageSize?: number
  isRead?: boolean
  type?: string
}

export interface MarkAsReadRequest {
  notificationIds: string[]
}

export interface NotificationStats {
  totalCount: number
  unreadCount: number
  readCount: number
  todayCount: number
}

// ===== NOTIFICATION API ENDPOINTS =====
export const notificationAPI = {
  /**
   * Lấy danh sách notifications với pagination
   */
  async getNotifications(params: GetNotificationsRequest = {}): Promise<ListBaseResponse<NotificationResponseDto>> {
    const searchParams = new URLSearchParams()
    
    if (params.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString())
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    if (params.isRead !== undefined) searchParams.append('isRead', params.isRead.toString())
    if (params.type) searchParams.append('type', params.type)

    const queryString = searchParams.toString()
    const url = `/api/notifications${queryString ? `?${queryString}` : ''}`
    
    const response = await api.get<ListBaseResponse<NotificationResponseDto>>(url)
    return response.data
  },

  /**
   * Lấy thống kê notifications
   */
  async getNotificationStats(): Promise<ItemBaseResponse<NotificationStats>> {
    const response = await api.get<ItemBaseResponse<NotificationStats>>('/api/notifications/stats')
    return response.data
  },

  /**
   * Đánh dấu notifications là đã đọc
   */
  async markAsRead(request: MarkAsReadRequest): Promise<ItemBaseResponse<boolean>> {
    const response = await  api.patch<ItemBaseResponse<boolean>>('/api/notifications/mark-read', request)
    return response.data
  },

  /**
   * Đánh dấu tất cả notifications là đã đọc
   */
  async markAllAsRead(): Promise<ItemBaseResponse<boolean>> {
    const response = await api.patch<ItemBaseResponse<boolean>>('/api/notifications/mark-all-read')
    return response.data
  },

  /**
   * Xóa notification
   */
  async deleteNotification(notificationId: string): Promise<ItemBaseResponse<boolean>> {
    const response = await api.delete<ItemBaseResponse<boolean>>(`/api/notifications/${notificationId}`)
    return response.data
  },

  /**
   * Xóa nhiều notifications
   */
  async deleteNotifications(notificationIds: string[]): Promise<ItemBaseResponse<boolean>> {
    const response = await api.delete<ItemBaseResponse<boolean>>('/api/notifications', {
      data: { notificationIds }
    })
    return response.data
  },

  /**
   * Lấy chi tiết một notification
   */
  async getNotificationById(notificationId: string): Promise<ItemBaseResponse<NotificationResponseDto>> {
    const response = await api.get<ItemBaseResponse<NotificationResponseDto>>(`/api/notifications/${notificationId}`)
    return response.data
  }
}

export default notificationAPI