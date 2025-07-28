import  { useState } from 'react'
import { Main } from '@/components/layout/main'
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
import { OrderById } from '@/@types/manage-order.types'

function ManageOrderContent() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10
  })

  const { open, setOpen, currentRow } = useOrdersContext()

  // Fetch orders data
  const { data: ordersResponse, isLoading: ordersLoading, error: ordersError } = useOrders(queryParams)

  // Fetch users data for customer information
  const { data: usersResponse, isLoading: usersLoading } = useGetListUser({
    pageSize: 1000 // Get all users for lookup
  })

  // Transform and prepare data
  const orderList = ordersResponse?.data?.items?.map(transformOrderData) || []
  const userList = usersResponse?.data?.items || []

  // Create columns with user data
  const columns = createOrderColumns({ user: userList })

  // Calculate statistics
  const totalOrders = ordersResponse?.data?.totalCount || 0
  const processedOrders = orderList.filter((order) =>
    ['CONFIRMED', 'IN_DESIGN', 'IN_PRODUCTION'].includes(order.status)
  ).length
  const deliveredOrders = orderList.filter((order) => order.status === 'COMPLETED').length
  const returnAmount = orderList
    .filter((order) => order.status === 'RETURNED')
    .reduce((total, order) => total + (order.totalAmount ?? 0), 0)

  // Loading state
  if (ordersLoading || usersLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (ordersError) {
    const errorMessage = ordersError instanceof Error ? ordersError.message : 'Đã xảy ra lỗi'
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <p className='text-destructive mb-2'>Không thể tải danh sách đơn hàng</p>
          <p className='text-muted-foreground text-sm'>{errorMessage}</p>
        </div>
      </div>
    )
  }

  const isDetailOpen = open === 'view' || open === 'edit'
  const handleCloseSidebar = () => setOpen(null)

  return (
    <div className='flex h-full relative'>
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isDetailOpen ? 'mr-80 lg:mr-96' : ''}`}>
        <div className='space-y-6'>
          {/* Page Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Quản lý đơn hàng</h1>
              <p className='text-muted-foreground'>Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <OrderStatistics
            totalOrders={totalOrders}
            processedOrders={processedOrders}
            deliveredOrders={deliveredOrders}
            returnAmount={returnAmount}
            isLoading={ordersLoading}
          />

          {/* Orders Table */}
          <div className='rounded-lg border bg-card'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <h2 className='text-lg font-semibold'>Tất cả đơn hàng</h2>
                  <p className='text-sm text-muted-foreground'>Nhận được {totalOrders} đơn hàng cần xử lý</p>
                </div>
              </div>

              <OrderTable
                columns={columns}
                data={orderList}
                isLoading={ordersLoading}
                error={ordersError instanceof Error ? ordersError.message : null}
              />
            </div>
          </div>
        </div>

        {/* Other Dialogs (except detail) */}
        <OrderDialogs />
      </div>

      {/* Order Detail Sidebar */}
      <OrderDetailSidebar order={currentRow as OrderById} isOpen={isDetailOpen} onClose={handleCloseSidebar} />
    </div>
  )
}

export default function ManageOrderPage() {
  return (
    <OrderProvider>
      <Main>
        <ManageOrderContent />
      </Main>
    </OrderProvider>
  )
}
