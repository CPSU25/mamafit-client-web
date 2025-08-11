// index.tsx - Enhanced Manage Order Page
import { useMemo } from 'react'
import { AlertCircle, Package2 } from 'lucide-react'

import { Main } from '@/components/layout/main'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useGetListUser } from '@/services/admin/manage-user.service'

import { transformOrderData } from './data/schema'
import { createBranchOrderColumns } from './components/branch-order-columns'
import { BranchOrderTable } from './components/branch-order-table'
import { OrderStatistics } from './components/branch-order-statistics'
import { OrderDialogs } from './components/branch-order-dialogs'
import { BranchOrderDetailSidebar } from './components/branch-order-detail-sidebar'
import BranchOrderProvider, { useBranchOrders } from './contexts/branch-order-context'

import type { BranchOrderType } from '@/@types/branch-order.types'
import { useGetBranchOrders } from '@/services/branch/branch-order.service'

// Constants
const USERS_FETCH_SIZE = 1000

// Enhanced Loading skeleton component
const OrderPageSkeleton = () => (
  <div className='space-y-8'>
    {/* Header skeleton with gradient */}
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='h-10 w-80 bg-gradient-to-r from-violet-200 to-purple-200 dark:from-violet-800 dark:to-purple-800 animate-pulse rounded-lg' />
        <div className='h-5 w-96 bg-violet-100 dark:bg-violet-900 animate-pulse rounded-md' />
      </div>
    </div>

    {/* Enhanced Statistics skeleton */}
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className='border-violet-200 dark:border-violet-800 shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='h-4 w-28 bg-violet-100 dark:bg-violet-900 animate-pulse rounded-md' />
            <div className='h-10 w-10 bg-violet-100 dark:bg-violet-900 animate-pulse rounded-xl' />
          </CardHeader>
          <CardContent>
            <div className='h-8 w-24 bg-violet-200 dark:bg-violet-800 animate-pulse rounded-md mb-2' />
            <div className='h-4 w-32 bg-violet-100 dark:bg-violet-900 animate-pulse rounded-md' />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Enhanced Table skeleton */}
    <Card className='border-violet-200 dark:border-violet-800 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30'>
        <div className='h-6 w-40 bg-violet-200 dark:bg-violet-800 animate-pulse rounded-md' />
        <div className='h-4 w-64 bg-violet-100 dark:bg-violet-900 animate-pulse rounded-md' />
      </CardHeader>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='h-16 bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-950/20 dark:to-transparent animate-pulse rounded-lg' />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Enhanced Error state component
const OrderPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <div className='flex items-center justify-center min-h-[500px]'>
      <Alert variant='destructive' className='max-w-lg border-red-200 dark:border-red-800 shadow-lg'>
        <AlertCircle className='h-5 w-5' />
        <AlertDescription className='space-y-3'>
          <div>
            <p className='font-semibold text-lg'>Không thể tải danh sách đơn hàng</p>
            <p className='text-sm mt-2'>{errorMessage}</p>
          </div>
          <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
            <div className='w-2 h-2 bg-red-400 rounded-full animate-pulse' />
            <span>Vui lòng thử lại sau hoặc liên hệ bộ phận kỹ thuật</span>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

function ManageOrderContent() {
  

  const { open, setOpen, currentRow } = useBranchOrders()

  // Fetch orders data
  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useGetBranchOrders()
  // Fetch users data for customer information lookup
  const { data: usersResponse, isLoading: usersLoading } = useGetListUser({
    pageSize: USERS_FETCH_SIZE
  })

  // Memoized data transformations for performance
  const orderList = useMemo(
    () => ordersResponse?.data?.map(transformOrderData) || [],
    [ordersResponse?.data]
  )

  const userList = useMemo(() => usersResponse?.data?.items || [], [usersResponse?.data?.items])

  // Memoized columns creation
  const columns = useMemo(() => createBranchOrderColumns({ user: userList }), [userList])

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const totalOrders = ordersResponse?.data.length || 0
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
  }, [ordersResponse?.data.length, orderList])

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
        <div className='container mx-auto py-6 space-y-6'>
          {/* Page Header */}
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <Package2 className='h-6 w-6' />
                <h1 className='text-2xl font-bold tracking-tight'>Quản lý đơn hàng</h1>
              </div>
              <p className='text-muted-foreground'>Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
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
          <Card>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg font-semibold'>Tất cả đơn hàng</CardTitle>
                  <p className='text-sm text-muted-foreground'>Nhận được {statistics.totalOrders} đơn hàng cần xử lý</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <BranchOrderTable
                columns={columns}
                data={orderList}
                isLoading={ordersLoading}
                error={ordersError ? String((ordersError as Error)?.message ?? ordersError) : null}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dialogs (except detail sidebar) */}
        <OrderDialogs />
      </div>

      {/* Order Detail Sidebar */}
      <BranchOrderDetailSidebar
        order={currentRow as BranchOrderType}
        isOpen={isDetailOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  )
}

export default function ManageBranchOrderPage() {
  return (
    <BranchOrderProvider>
      <Main className='min-h-screen p-0 bg-gradient-to-br from-violet-50/30 via-white to-purple-50/20 dark:from-violet-950/10 dark:via-background dark:to-purple-950/10'>
        <ManageOrderContent />
      </Main>
    </BranchOrderProvider>
  )
}