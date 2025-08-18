// index.tsx - Trang Quản Lý Đơn Hàng
import { useMemo, useState } from 'react'
import { Package2, ShoppingCart, Package, CheckCircle, RotateCcw, Sparkles } from 'lucide-react'

import { Main } from '@/components/layout/main'
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
const DEFAULT_PAGE_SIZE = 100
const USERS_FETCH_SIZE = 100

// Component Statistics Cards theo pattern dự án
interface OrderStatisticsProps {
  totalOrders: number
  processedOrders: number
  deliveredOrders: number
  returnAmount: number
  isLoading?: boolean
}

function OrderStatistics({
  totalOrders,
  processedOrders,
  deliveredOrders,
  returnAmount,
  isLoading = false
}: OrderStatisticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const stats = [
    {
      title: 'Tổng đơn hàng',
      subtitle: 'Số đơn nhận được',
      value: totalOrders,
      icon: ShoppingCart,
      iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      cardBg:
        'border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background'
    },
    {
      title: 'Đang xử lý',
      subtitle: 'Đơn đã xác nhận',
      value: processedOrders,
      icon: Package,
      iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      cardBg:
        'border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background'
    },
    {
      title: 'Hoàn thành',
      subtitle: 'Đã giao thành công',
      value: deliveredOrders,
      icon: CheckCircle,
      iconBg: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      cardBg:
        'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background'
    },
    {
      title: 'Giá trị trả hàng',
      subtitle: 'Thiệt hại do hoàn trả',
      value: returnAmount,
      icon: RotateCcw,
      iconBg: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      cardBg:
        'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-background',
      isAmount: true
    }
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='hover:shadow-lg transition-all duration-300'>
            <CardHeader className='pb-2'>
              <div className='h-4 w-24 bg-muted rounded animate-pulse' />
              <div className='h-3 w-32 bg-muted rounded mt-1 animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='h-7 w-20 bg-muted rounded animate-pulse' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`${stat.cardBg} hover:shadow-lg transition-all duration-300`}>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-muted-foreground'>{stat.title}</p>
                  <p className='text-2xl font-bold'>
                    {stat.isAmount ? formatCurrency(stat.value) : stat.value.toLocaleString()}
                  </p>
                  <p className='text-xs text-muted-foreground'>{stat.subtitle}</p>
                </div>
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className='h-6 w-6' />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// Component Loading skeleton theo pattern dự án
const OrderPageSkeleton = () => (
  <Main>
    <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
      <div className='text-center space-y-4'>
        <div className='relative'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
          <Package2 className='h-8 w-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        </div>
        <div>
          <p className='text-lg font-medium text-foreground'>Đang tải đơn hàng...</p>
          <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    </div>
  </Main>
)

// Component Error state theo pattern dự án
const OrderPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <Main>
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-4'>
              <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                <Package2 className='h-8 w-8 text-destructive' />
              </div>
              <div>
                <p className='text-lg font-semibold text-destructive'>Không thể tải danh sách đơn hàng</p>
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
    <Main>
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${isDetailOpen ? 'mr-80 lg:mr-96' : ''}`}>
        <div className='space-y-6'>
          {/* Header theo pattern dự án */}
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Package2 className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                    Quản Lý Đơn Hàng
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý và theo dõi tất cả đơn hàng trong hệ thống
                    <Sparkles className='h-3 w-3 text-violet-500' />
                  </p>
                </div>
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
          <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
            <CardContent className='p-0'>
              <div className='p-6 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-lg font-semibold'>Tất cả đơn hàng</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      Nhận được {statistics.totalOrders} đơn hàng cần xử lý
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
    </Main>
  )
}

export default function ManageOrderPage() {
  return (
    <OrderProvider>
      <Main className='space-y-6'>
        <ManageOrderContent />
      </Main>
    </OrderProvider>
  )
}
