import { ItemBaseResponse } from './response'

// Dashboard Summary API Types
export interface TotalsDto {
  revenue: number
  orders: number
  newCustomer: number
  avgOrderValue: number
}

export interface TrendsDto {
  revenuePct: number
  ordersPct: number
  newCustomersPct: number
  aovPct: number
}

export interface DashboardSummaryResponse {
  totals: TotalsDto
  trends: TrendsDto
}

// Revenue Analytics API Types
export interface RevenuePointDto {
  month: string
  revenue: number
  lastYear?: number
  orders: number
}

// Order Status API Types
export interface OrderStatusCountDto {
  status: string
  value: number
}

export interface OrderStatusResponse {
  range: string
  counts: OrderStatusCountDto[]
}

// Branch Performance API Types
export interface BranchPerformanceDto {
  branchId: string
  branchName: string
  revenue: number
  orders: number
  growthPct: number
}

export interface BranchTopResponse {
  metric: string
  items: BranchPerformanceDto[]
}

// Recent Orders API Types
export interface CustomerMiniDto {
  id: string
  name: string
  avatar?: string
  phone?: string
}

export interface PrimaryItemDto {
  maternityDressName?: string
  presetName?: string
}

export interface BranchMiniDto {
  id: string
  name: string
}

export interface RecentOrderItemDto {
  id: string
  code: string
  customer: CustomerMiniDto
  primaryItem: PrimaryItemDto
  branch: BranchMiniDto
  amount: number
  status?: string
  createdAt: string
}

export interface RecentOrdersResponse {
  items: RecentOrderItemDto[]
}

// Dashboard Summary API Response
export type DashboardSummaryApiResponse = ItemBaseResponse<DashboardSummaryResponse>

// Revenue Analytics API Response
export type RevenueAnalyticsApiResponse = ItemBaseResponse<{ data: RevenuePointDto[] }>

// Order Status API Response
export type OrderStatusApiResponse = ItemBaseResponse<OrderStatusResponse>

// Branch Performance API Response
export type BranchTopApiResponse = ItemBaseResponse<BranchTopResponse>

// Recent Orders API Response
export type RecentOrdersApiResponse = ItemBaseResponse<RecentOrdersResponse>

// Dashboard Query Params
export interface DashboardSummaryParams {
  startTime: string // DateTime ISO string
  endTime: string // DateTime ISO string
}

export interface RevenueAnalyticsParams {
  groupBy?: string // default "month"
  range?: string // default "this_year"
  compare?: string // "yoy", "yoy=true", "true" để enable YoY compare
}

export interface OrderStatusParams {
  range?: string // default "month"
}

export interface BranchTopParams {
  metric?: string // default "revenue"
  limit?: number // default 5
  range?: string // default "month"
}

export interface RecentOrdersParams {
  limit?: number // default 10
}

// Notification API Types
export interface NotificationMetadata {
  orderId?: string
  paymentStatus?: string
  orderStatus?: string
  warrantyRequestId?: string
  orderItemIds?: string
  orderCode?: string
}

export interface NotificationItem {
  id: string
  isRead: boolean
  createdBy: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  notificationTitle: string
  notificationContent: string
  type?: string
  actionUrl?: string
  metadata: NotificationMetadata
  receiverId: string
}

export interface NotificationResponse {
  items: NotificationItem[]
  pageNumber: number
  totalPages: number
  totalCount: number
  pageSize: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface NotificationParams {
  index?: number // pageNumber
  pageSize?: number // default 10
  search?: string
  type?: string
  sortBy?: string
}

// Notification API Response
export type NotificationApiResponse = ItemBaseResponse<NotificationResponse>
