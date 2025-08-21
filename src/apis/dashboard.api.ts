import { api } from '@/lib/axios/axios'
import {
  DashboardSummaryApiResponse,
  DashboardSummaryParams,
  RevenueAnalyticsApiResponse,
  RevenueAnalyticsParams,
  OrderStatusApiResponse,
  OrderStatusParams,
  BranchTopApiResponse,
  BranchTopParams,
  RecentOrdersApiResponse,
  RecentOrdersParams,
  NotificationApiResponse,
  NotificationParams
} from '@/@types/dashboard.type'

const dashboardApi = {
  // GET /api/transaction/dashboard/summary
  getDashboardSummary: async (params: DashboardSummaryParams): Promise<DashboardSummaryApiResponse> => {
    const response = await api.get('/transaction/dashboard/summary', {
      params: {
        startTime: params.startTime,
        endTime: params.endTime
      }
    })
    return response.data
  },

  // GET /api/transaction/analytics/revenue
  getRevenueAnalytics: async (params?: RevenueAnalyticsParams): Promise<RevenueAnalyticsApiResponse> => {
    const response = await api.get('/transaction/analytics/revenue', {
      params: {
        groupBy: params?.groupBy || 'month',
        range: params?.range || 'this_year',
        compare: params?.compare
      }
    })
    return response.data
  },

  // GET /api/transaction/analytics/orders/status
  getOrderStatus: async (params?: OrderStatusParams): Promise<OrderStatusApiResponse> => {
    const response = await api.get('/transaction/analytics/orders/status', {
      params: {
        range: params?.range || 'month'
      }
    })
    return response.data
  },

  // GET /api/transaction/analytics/branches/top
  getBranchTop: async (params?: BranchTopParams): Promise<BranchTopApiResponse> => {
    const response = await api.get('/transaction/analytics/branches/top', {
      params: {
        metric: params?.metric || 'revenue',
        limit: params?.limit || 5,
        range: params?.range || 'month'
      }
    })
    return response.data
  },

  // GET /api/transaction/orders/recent
  getRecentOrders: async (params?: RecentOrdersParams): Promise<RecentOrdersApiResponse> => {
    const response = await api.get('/transaction/orders/recent', {
      params: {
        limit: params?.limit || 10
      }
    })
    return response.data
  },

  // GET /api/notification
  getNotifications: async (params?: NotificationParams): Promise<NotificationApiResponse> => {
    const response = await api.get('/notification', {
      params: {
        index: params?.index || 1,
        pageSize: params?.pageSize || 10,
        search: params?.search,
        type: params?.type,
        sortBy: params?.sortBy
      }
    })
    return response.data
  }
}

export default dashboardApi
