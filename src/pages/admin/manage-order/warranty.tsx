// warranty.tsx - Trang Quản Lý Đơn Hàng Bảo Hành
import { useMemo, useState } from 'react'
import { Shield, ShieldCheck, Sparkles } from 'lucide-react'

import { Main } from '@/components/layout/main'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

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
const DEFAULT_PAGE_SIZE = 1000
const USERS_FETCH_SIZE = 1000

// Component Loading skeleton theo pattern dự án
const WarrantyOrderPageSkeleton = () => (
  <Main>
    <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
      <div className='text-center space-y-4'>
        <div className='relative'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto'></div>
          <Shield className='h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        </div>
        <div>
          <p className='text-lg font-medium text-foreground'>Đang tải đơn bảo hành...</p>
          <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    </div>
  </Main>
)

// Component Error state theo pattern dự án
const WarrantyOrderPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <Main>
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-4'>
              <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                <Shield className='h-8 w-8 text-destructive' />
              </div>
              <div>
                <p className='text-lg font-semibold text-destructive'>Không thể tải danh sách đơn bảo hành</p>
                <p className='text-sm text-muted-foreground mt-2'>{errorMessage}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className='px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors'
              >
                Thử lại
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Main>
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
    return allOrders.filter((order) => order.type === 'WARRANTY').slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
    <div>
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isDetailOpen ? 'mr-80 lg:mr-96' : ''}`}>
        <div className='space-y-6'>
          {/* Header theo pattern dự án */}
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg'>
                  <ShieldCheck className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent'>
                    Quản Lý Đơn Bảo Hành
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý và theo dõi tất cả đơn hàng bảo hành trong hệ thống
                    <Sparkles className='h-3 w-3 text-purple-500' />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards theo pattern dự án */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng đơn bảo hành</p>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{statistics.totalOrders}</p>
                    <p className='text-xs text-muted-foreground'>Đơn hàng bảo hành</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <Shield className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Đang bảo hành</p>
                    <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                      {statistics.processedOrders}
                    </p>
                    <p className='text-xs text-muted-foreground'>Đang xử lý bảo hành</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
                    <Shield className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Hoàn thành</p>
                    <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                      {statistics.deliveredOrders}
                    </p>
                    <p className='text-xs text-muted-foreground'>Bảo hành xong</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <ShieldCheck className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng giá trị</p>
                    <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        notation: 'compact'
                      }).format(statistics.returnAmount)}
                    </p>
                    <p className='text-xs text-muted-foreground'>Giá trị bảo hành</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
                    <Shield className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Table */}
          <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/10'>
            <CardContent className='p-0'>
              <div className='p-6 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-lg font-semibold'>Đơn hàng bảo hành</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      Có {statistics.totalOrders} đơn hàng bảo hành cần xử lý
                    </p>
                  </div>
                </div>
                <OrderTable
                  columns={columns}
                  data={orderList}
                  isLoading={ordersLoading}
                  error={ordersError instanceof Error ? ordersError.message : null}
                />
              </div>
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
      <Main className='space-y-6'>
        <WarrantyOrderContent />
      </Main>
    </OrderProvider>
  )
}
