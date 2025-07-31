import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { Main } from '@/components/layout/main'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useOrders } from '@/services/admin/manage-order.service'
import { useGetListUser } from '@/services/admin/manage-user.service'

import { transformOrderData } from './data/schema'
import { createOrderColumns } from './components/order-columns'
import { OrderTable } from './components/order-table'
import { OrderStatistics } from './components/order-statistics'
import { OrderDialogs } from './components/order-dialogs'
import { OrderDetailSidebar } from './components/order-detail-sidebar'
import OrderProvider from './contexts/order-context'
import { useOrders as useOrdersContext } from './contexts/order-context'

import type { OrderById } from '@/@types/manage-order.types'

// Constants
const DEFAULT_PAGE_SIZE = 10
const USERS_FETCH_SIZE = 1000

// Loading skeleton component
const OrderPageSkeleton = () => (
  <div className='space-y-6'>
    {/* Header skeleton */}
    <div className='space-y-2'>
      <div className='h-8 w-64 bg-muted animate-pulse rounded-md' />
      <div className='h-4 w-96 bg-muted animate-pulse rounded-md' />
    </div>

    {/* Statistics skeleton */}
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='h-4 w-24 bg-muted animate-pulse rounded-md' />
            <div className='h-4 w-4 bg-muted animate-pulse rounded-full' />
          </CardHeader>
          <CardContent>
            <div className='h-8 w-20 bg-muted animate-pulse rounded-md mb-1' />
            <div className='h-3 w-32 bg-muted animate-pulse rounded-md' />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Table skeleton */}
    <Card>
      <CardHeader>
        <div className='h-6 w-32 bg-muted animate-pulse rounded-md' />
        <div className='h-4 w-48 bg-muted animate-pulse rounded-md' />
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='h-16 bg-muted animate-pulse rounded-md' />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Error state component
const OrderPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <Alert variant='destructive' className='max-w-md'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription className='space-y-2'>
          <p className='font-medium'>Không thể tải danh sách đơn hàng</p>
          <p className='text-sm'>{errorMessage}</p>
        </AlertDescription>
      </Alert>
    </div>
  )
}

function ManageOrderContent() {
  const [queryParams] = useState({
    index: 0,
    pageSize: DEFAULT_PAGE_SIZE
  })

  const { open, setOpen, currentRow } = useOrdersContext()

  // Fetch orders data
  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useOrders(queryParams)

  // Fetch users data for customer information lookup
  const { data: usersResponse, isLoading: usersLoading } = useGetListUser({
    pageSize: USERS_FETCH_SIZE
  })

  // Memoized data transformations for performance
  const orderList = useMemo(
    () => ordersResponse?.data?.items?.map(transformOrderData) || [],
    [ordersResponse?.data?.items]
  )

  const userList = useMemo(() => usersResponse?.data?.items || [], [usersResponse?.data?.items])

  // Memoized columns creation
  const columns = useMemo(() => createOrderColumns({ user: userList }), [userList])

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const totalOrders = ordersResponse?.data?.totalCount || 0
    const processedOrders = orderList.filter((order) =>
      ['CONFIRMED', 'IN_DESIGN', 'IN_PRODUCTION'].includes(order.status)
    ).length
    const deliveredOrders = orderList.filter((order) => order.status === 'COMPLETED').length
    const returnAmount = orderList
      .filter((order) => order.status === 'RETURNED')
      .reduce((total, order) => total + (order.totalAmount ?? 0), 0)

    return {
      totalOrders,
      processedOrders,
      deliveredOrders,
      returnAmount
    }
  }, [ordersResponse?.data?.totalCount, orderList])

  // Loading state
  if (ordersLoading || usersLoading) {
    return <OrderPageSkeleton />
  }

  // Error state
  if (ordersError) {
    return <OrderPageError error={ordersError} />
  }

  const isDetailOpen = open === 'view' || open === 'edit'
  const handleCloseSidebar = () => setOpen(null)

  return (
    <div className='flex h-full relative'>
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isDetailOpen ? 'mr-80 lg:mr-96' : ''}`}>
        <div className='space-y-6'>
          {/* Page Header */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold tracking-tight'>Quản lý đơn hàng</h1>
                <p className='text-muted-foreground'>Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <OrderStatistics
            totalOrders={statistics.totalOrders}
            processedOrders={statistics.processedOrders}
            deliveredOrders={statistics.deliveredOrders}
            returnAmount={statistics.returnAmount}
            isLoading={ordersLoading}
          />

          {/* Orders Table */}
          <Card className='border-0 shadow-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg font-semibold'>Tất cả đơn hàng</CardTitle>
                  <p className='text-sm text-muted-foreground'>Nhận được {statistics.totalOrders} đơn hàng cần xử lý</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <OrderTable
                columns={columns}
                data={orderList}
                isLoading={ordersLoading}
                error={ordersError instanceof Error ? ordersError.message : null}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs (except detail sidebar) */}
        <OrderDialogs />
      </div>

      {/* Order Detail Sidebar */}
      <OrderDetailSidebar order={currentRow as OrderById} isOpen={isDetailOpen} onClose={handleCloseSidebar} />
    </div>
  )
}

/**
 * Manage Order Page - Admin Module
 *
 * Features:
 * - Hiển thị danh sách đơn hàng với pagination
 * - Thống kê tổng quan về orders
 * - Chi tiết đơn hàng trong sidebar
 * - Quản lý trạng thái đơn hàng
 *
 * @returns {JSX.Element} Order management page
 */
export default function ManageOrderPage() {
  return (
    <OrderProvider>
      <Main className='p-6'>
        <ManageOrderContent />
      </Main>
    </OrderProvider>
  )
}
