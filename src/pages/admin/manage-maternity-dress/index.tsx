// index.tsx - Main Maternity Dress Page with Enhanced UI
import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { useGetMaternityDresses } from '@/services/admin/maternity-dress.service'
import { transformMaternityDressListToMaternityDress } from './data/schema'
import { Package, Package2, TrendingUp, Activity, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { columns } from './components/maternity-dress-columns'
import { MaternityDressDialogs } from './components/maternity-dress-dialogs'
import { MaternityDressPrimaryButtons } from './components/maternity-dress-primary-buttons'
import { MaternityDressTable } from './components/maternity-dress-table'
import MaternityDressProvider from './context/maternity-dress-context'

export default function ManageMaternityDressPage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10
  })

  const { data: apiResponse, isLoading, error } = useGetMaternityDresses(queryParams)

  // Transform API data to component format
  const maternityDressList = apiResponse?.data?.items?.map(transformMaternityDressListToMaternityDress) || []

  // Calculate statistics
  const totalMaternityDresses = maternityDressList.length
  const activeMaternityDresses = maternityDressList.filter((dress) => dress.globalStatus === 'ACTIVE').length
  const maternityDressesWithImages = maternityDressList.filter(
    (dress) => dress.images && dress.images.length > 0
  ).length
  const utilizationRate =
    totalMaternityDresses > 0 ? Math.round((activeMaternityDresses / totalMaternityDresses) * 100) : 0

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center space-y-4'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
              <Package className='h-8 w-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div>
              <p className='text-lg font-medium text-foreground'>Đang tải đầm bầu...</p>
              <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
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
                  <p className='text-lg font-semibold text-destructive'>Không thể tải đầm bầu</p>
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

  return (
    <MaternityDressProvider>
      <Main className='space-y-6'>
        {/* Enhanced Header Section */}
        <div className='space-y-6'>
          {/* Title and Actions */}
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Package className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                    Quản Lý Đầm Bầu
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý các mẫu đầm bầu trong hệ thống
                    <Sparkles className='h-3 w-3 text-violet-500' />
                  </p>
                </div>
              </div>
            </div>
            <MaternityDressPrimaryButtons />
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng đầm bầu</p>
                    <p className='text-2xl font-bold text-violet-600 dark:text-violet-400'>{totalMaternityDresses}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                    <Package className='h-6 w-6 text-violet-600 dark:text-violet-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Đang hoạt động</p>
                    <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{activeMaternityDresses}</p>
                    <Badge variant='outline' className='text-xs border-green-300 text-green-700 dark:text-green-400'>
                      {utilizationRate}% sử dụng
                    </Badge>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <Activity className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Có hình ảnh</p>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{maternityDressesWithImages}</p>
                    <Progress
                      value={(maternityDressesWithImages / Math.max(totalMaternityDresses, 1)) * 100}
                      className='h-1.5 bg-blue-100 dark:bg-blue-900/30 [&_.progress-indicator]:bg-blue-500'
                    />
                  </div>
                  <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <Package2 className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tỷ lệ tăng trưởng</p>
                    <div className='flex items-baseline gap-2'>
                      <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>+8%</p>
                      <TrendingUp className='h-4 w-4 text-orange-500' />
                    </div>
                    <p className='text-xs text-muted-foreground'>So với tháng trước</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
                    <TrendingUp className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section with Enhanced Styling */}
        <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
          <CardContent className='p-0'>
            <div className='p-6 space-y-4'>
              <MaternityDressTable data={maternityDressList} columns={columns} />
            </div>
          </CardContent>
        </Card>
      </Main>

      <MaternityDressDialogs />
    </MaternityDressProvider>
  )
}
