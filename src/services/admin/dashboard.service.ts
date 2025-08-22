import { useQuery } from '@tanstack/react-query'
import dashboardApi from '@/apis/dashboard.api'
import {
  DashboardSummaryParams,
  RevenueAnalyticsParams,
  OrderStatusParams,
  BranchTopParams,
  RecentOrdersParams,
  NotificationParams
} from '@/@types/dashboard.type'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: (params: DashboardSummaryParams) => [...dashboardKeys.all, 'summary', params] as const,
  revenue: (params?: RevenueAnalyticsParams) => [...dashboardKeys.all, 'revenue', params] as const,
  orderStatus: (params?: OrderStatusParams) => [...dashboardKeys.all, 'order-status', params] as const,
  branchTop: (params?: BranchTopParams) => [...dashboardKeys.all, 'branch-top', params] as const,
  recentOrders: (params?: RecentOrdersParams) => [...dashboardKeys.all, 'recent-orders', params] as const,
  notifications: (params?: NotificationParams) => [...dashboardKeys.all, 'notifications', params] as const
}

// Dashboard Summary Hook
export const useDashboardSummary = (params: DashboardSummaryParams) => {
  return useQuery({
    queryKey: dashboardKeys.summary(params),
    queryFn: () => dashboardApi.getDashboardSummary(params),
    staleTime: 60_000, // 1 minute cache
    retry: 1
  })
}

// Revenue Analytics Hook
export const useRevenueAnalytics = (params?: RevenueAnalyticsParams) => {
  return useQuery({
    queryKey: dashboardKeys.revenue(params),
    queryFn: () => dashboardApi.getRevenueAnalytics(params),
    staleTime: 60_000, // 1 minute cache
    retry: 1
  })
}

// Order Status Hook
export const useOrderStatus = (params?: OrderStatusParams) => {
  return useQuery({
    queryKey: dashboardKeys.orderStatus(params),
    queryFn: () => dashboardApi.getOrderStatus(params),
    staleTime: 60_000, // 1 minute cache
    retry: 1
  })
}

// Branch Top Performance Hook
export const useBranchTop = (params?: BranchTopParams) => {
  return useQuery({
    queryKey: dashboardKeys.branchTop(params),
    queryFn: () => dashboardApi.getBranchTop(params),
    staleTime: 60_000, // 1 minute cache
    retry: 1
  })
}

// Recent Orders Hook
export const useRecentOrders = (params?: RecentOrdersParams) => {
  return useQuery({
    queryKey: dashboardKeys.recentOrders(params),
    queryFn: () => dashboardApi.getRecentOrders(params),
    // 30 seconds cache for real-time data
    retry: 1
  })
}

// Notifications Hook
export const useNotifications = (params?: NotificationParams) => {
  return useQuery({
    queryKey: dashboardKeys.notifications(params),
    queryFn: () => dashboardApi.getNotifications(params),
    // 30 seconds cache for real-time data
    retry: 1
  })
}
