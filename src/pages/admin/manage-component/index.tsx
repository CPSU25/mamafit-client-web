import { useMemo, useState } from 'react'
import { Boxes, Sparkles } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useComponents as useComponentsAPI } from '@/services/admin/manage-component.service'
import { transformComponentListToComponent } from './data/schema'

import { columns } from './components/components-columns'
import { ComponentsDialogs } from './components/components-dialogs'
import { ComponentsPrimaryButtons } from './components/components-primary-buttons'
import { ComponentsTable } from './components/components-table'
import ComponentsProvider from './context/components-context'

// Component Loading skeleton theo pattern dự án
const ComponentPageSkeleton = () => (
  <Main>
    <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
      <div className='text-center space-y-4'>
        <div className='relative'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
          <Boxes className='h-8 w-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        </div>
        <div>
          <p className='text-lg font-medium text-foreground'>Đang tải thành phần...</p>
          <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    </div>
  </Main>
)

// Component Error state theo pattern dự án
const ComponentPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <Main>
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-4'>
              <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                <Boxes className='h-8 w-8 text-destructive' />
              </div>
              <div>
                <p className='text-lg font-semibold text-destructive'>Không thể tải danh sách thành phần</p>
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

function ManageComponentContent() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 100
  })

  const { data: apiResponse, isLoading, error } = useComponentsAPI(queryParams)

  // Transform API data to component format
  const componentList = useMemo(
    () => apiResponse?.data?.items?.map(transformComponentListToComponent) || [],
    [apiResponse?.data?.items]
  )

  // Memoized statistics calculations
  const statistics = useMemo(() => {
    const totalComponents = componentList.length
    const activeComponents = componentList.filter((component) => component.globalStatus === 'ACTIVE').length
    const inactiveComponents = totalComponents - activeComponents

    return {
      totalComponents,
      activeComponents,
      inactiveComponents
    }
  }, [componentList])

  // Loading state
  if (isLoading) {
    return <ComponentPageSkeleton />
  }

  // Error state
  if (error) {
    return <ComponentPageError error={error} />
  }

  return (
    <Main className='space-y-6'>
      {/* Header theo pattern dự án */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
              <Boxes className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                Quản Lý Thành Phần
              </h1>
              <p className='text-sm text-muted-foreground flex items-center gap-1'>
                Quản lý thành phần và tùy chọn của chúng
                <Sparkles className='h-3 w-3 text-violet-500' />
              </p>
            </div>
          </div>
        </div>
        <ComponentsPrimaryButtons />
      </div>

      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>Tổng thành phần</p>
                <p className='text-2xl font-bold text-violet-600 dark:text-violet-400'>{statistics.totalComponents}</p>
                <p className='text-xs text-muted-foreground'>Tất cả thành phần</p>
              </div>
              <div className='h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                <Boxes className='h-6 w-6 text-violet-600 dark:text-violet-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>Đang hoạt động</p>
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{statistics.activeComponents}</p>
                <p className='text-xs text-muted-foreground'>Thành phần có sẵn</p>
              </div>
              <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                <Boxes className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-muted-foreground'>Tạm ngưng</p>
                <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                  {statistics.inactiveComponents}
                </p>
                <p className='text-xs text-muted-foreground'>Không sử dụng</p>
              </div>
              <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
                <Boxes className='h-6 w-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components Table */}
      <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
        <CardContent className='p-0'>
          <div className='p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <CardTitle className='text-lg font-semibold'>Tất cả thành phần</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Quản lý {statistics.totalComponents} thành phần trong hệ thống
                </p>
              </div>
            </div>
            <ComponentsTable data={componentList} columns={columns} />
          </div>
        </CardContent>
      </Card>

      <ComponentsDialogs />
    </Main>
  )
}

export default function ManageComponentPage() {
  return (
    <ComponentsProvider>
      <ManageComponentContent />
    </ComponentsProvider>
  )
}
