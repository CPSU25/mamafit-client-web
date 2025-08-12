// warranty.tsx - Quản lý đơn hàng bảo hành
import { useMemo, useState } from 'react'
import { Shield, ShieldCheck } from 'lucide-react'

import { Main } from '@/components/layout/main'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useOrders } from '@/services/admin/manage-order.service'
import { useGetListUser } from '@/services/admin/manage-user.service'

import { transformOrderData } from './data/schema'
import { createOrderColumns } from './components/order-columns'
import { OrderTable } from './components/order-table'

import { OrderDialogs } from './components/order-dialogs'
import { OrderDetailSidebar } from './components/order-detail-sidebar'
import OrderProvider from './contexts/order-context'
import { useOrders as useOrdersContext } from './contexts/order-context'

import type { OrderById } from '@/@types/manage-order.types'

// Constants
const DEFAULT_PAGE_SIZE = 20
const USERS_FETCH_SIZE = 1000

// Enhanced Loading skeleton component
const WarrantyOrderPageSkeleton = () => (
  <div className='space-y-8'>
    {/* Header skeleton with gradient */}
    <div className='space-y-4'>
      <div className='space-y-3'>
        <div className='h-10 w-80 bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 animate-pulse rounded-lg' />
        <div className='h-5 w-96 bg-blue-100 dark:bg-blue-900 animate-pulse rounded-md' />
      </div>
    </div>

    {/* Enhanced Statistics skeleton */}
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className='border-blue-200 dark:border-blue-800 shadow-lg'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <div className='h-4 w-28 bg-blue-100 dark:bg-blue-900 animate-pulse rounded-md' />
            <div className='h-10 w-10 bg-blue-100 dark:bg-blue-900 animate-pulse rounded-xl' />
          </CardHeader>
          <CardContent>
            <div className='h-8 w-24 bg-blue-200 dark:bg-blue-800 animate-pulse rounded-md mb-2' />
            <div className='h-4 w-32 bg-blue-100 dark:bg-blue-900 animate-pulse rounded-md' />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Enhanced Table skeleton */}
    <Card className='border-blue-200 dark:border-blue-800 shadow-lg'>
      <CardHeader className='bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30'>
        <div className='h-6 w-40 bg-blue-200 dark:bg-blue-800 animate-pulse rounded-md' />
        <div className='h-4 w-64 bg-blue-100 dark:bg-blue-900 animate-pulse rounded-md' />
      </CardHeader>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='h-16 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent animate-pulse rounded-lg'
            />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)

// Enhanced Error state component
const WarrantyOrderPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <div className='flex items-center justify-center min-h-[500px]'>
      <Alert variant='destructive' className='max-w-lg border-red-200 dark:border-red-800 shadow-lg'>
        <Shield className='h-5 w-5' />
        <AlertDescription className='space-y-3'>
          <div>
            <p className='font-semibold text-lg'>Không thể tải danh sách đơn hàng bảo hành</p>
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

function WarrantyOrderContent() {
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

  // Memoized data transformations for performance - FILTER ONLY WARRANTY ORDERS
  const orderList = useMemo(() => {
    const allOrders = ordersResponse?.data?.items?.map(transformOrderData) || []
    // Filter only WARRANTY type orders
    return allOrders.filter((order) => order.type === 'WARRANTY')
  }, [ordersResponse?.data?.items])

  const userList = useMemo(() => usersResponse?.data?.items || [], [usersResponse?.data?.items])

  // Memoized columns creation
  const columns = useMemo(() => createOrderColumns({ user: userList }), [userList])

  // Memoized statistics calculations - specific to warranty orders
  const statistics = useMemo(() => {
    const totalWarrantyOrders = orderList.length
    const inWarrantyOrders = orderList.filter((order) =>
      ['IN_WARRANTY', 'WARRANTY_CHECK'].includes(order.status)
    ).length
    const completedWarrantyOrders = orderList.filter((order) => order.status === 'COMPLETED').length
    const warrantyAmount = orderList.reduce((total, order) => total + (order.totalAmount ?? 0), 0)

    return {
      totalOrders: totalWarrantyOrders,
      processedOrders: inWarrantyOrders,
      deliveredOrders: completedWarrantyOrders,
      returnAmount: warrantyAmount
    }
  }, [orderList])

  // Loading state
  if (ordersLoading || usersLoading) {
    return <WarrantyOrderPageSkeleton />
  }

  // Error state
  if (ordersError) {
    return <WarrantyOrderPageError error={ordersError} />
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
                <ShieldCheck className='h-6 w-6 text-blue-600' />
                <h1 className='text-2xl font-bold tracking-tight'>Quản lý đơn hàng bảo hành</h1>
              </div>
              <p className='text-muted-foreground'>Quản lý và theo dõi tất cả đơn hàng bảo hành trong hệ thống</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='border-blue-200 dark:border-blue-800 shadow-lg'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                  Tổng đơn bảo hành
                </CardTitle>
                <Shield className='h-4 w-4 text-blue-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>{statistics.totalOrders}</div>
                <p className='text-xs text-muted-foreground'>Đơn hàng bảo hành</p>
              </CardContent>
            </Card>

            <Card className='border-orange-200 dark:border-orange-800 shadow-lg'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-orange-700 dark:text-orange-300'>
                  Đang bảo hành
                </CardTitle>
                <Shield className='h-4 w-4 text-orange-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-orange-600'>{statistics.processedOrders}</div>
                <p className='text-xs text-muted-foreground'>Đang xử lý bảo hành</p>
              </CardContent>
            </Card>

            <Card className='border-green-200 dark:border-green-800 shadow-lg'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-green-700 dark:text-green-300'>Hoàn thành</CardTitle>
                <ShieldCheck className='h-4 w-4 text-green-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>{statistics.deliveredOrders}</div>
                <p className='text-xs text-muted-foreground'>Bảo hành xong</p>
              </CardContent>
            </Card>

            <Card className='border-purple-200 dark:border-purple-800 shadow-lg'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-purple-700 dark:text-purple-300'>Tổng giá trị</CardTitle>
                <Shield className='h-4 w-4 text-purple-600' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-purple-600'>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact'
                  }).format(statistics.returnAmount)}
                </div>
                <p className='text-xs text-muted-foreground'>Giá trị bảo hành</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg font-semibold'>Đơn hàng bảo hành</CardTitle>
                  <p className='text-sm text-muted-foreground'>
                    Có {statistics.totalOrders} đơn hàng bảo hành cần xử lý
                  </p>
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

export default function WarrantyOrderPage() {
  return (
    <OrderProvider>
      <Main className='min-h-screen p-0 bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/20 dark:from-blue-950/10 dark:via-background dark:to-cyan-950/10'>
        <WarrantyOrderContent />
      </Main>
    </OrderProvider>
  )
}
