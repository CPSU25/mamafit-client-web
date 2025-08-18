import { useMemo, useState } from 'react'
import { Main } from '@/components/layout/main'
import { useGetBranches } from '@/services/admin/manage-branch.service'
import { transformManageBranchTypeToBranch } from './data/schema'

import { BranchDialogs } from './components/branch-dialogs'
import { BranchPrimaryButtons } from './components/branch-primary-buttons'
import { BranchTable } from './components/branch-tables'
import BranchProvider from './context/branch-context'
import { Building, MapPin, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ManageBranchPage() {
  const [queryParams] = useState({
    index: 1,
    pageSize: 100,
    search: '',
    sortBy: ''
  })

  const { data: branchesResponse, isLoading, error } = useGetBranches(queryParams)

  // Transform API data to component format
  const branchList = useMemo(() => branchesResponse?.data?.items?.map(transformManageBranchTypeToBranch) || [], [branchesResponse])

  // Stats
  const totalBranches = branchList.length
  const totalManagers = new Set(branchList.map(b => b.branchManager.id)).size
  const avgOperatingHours = branchList.length > 0 ? 
    Math.round(branchList.reduce((acc, branch) => {
      const openHour = parseInt(branch.openingHour.split(':')[0])
      const closeHour = parseInt(branch.closingHour.split(':')[0])
      return acc + (closeHour - openHour)
    }, 0) / branchList.length) : 0

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center space-y-4'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
              <Building className='h-8 w-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div>
              <p className='text-lg font-medium text-foreground'>Đang tải chi nhánh...</p>
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
                  <Building className='h-8 w-8 text-destructive' />
                </div>
                <div>
                  <p className='text-lg font-semibold text-destructive'>Không thể tải danh sách chi nhánh</p>
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
    <BranchProvider>
      <Main className='space-y-6'>
        {/* Header */}
        <div className='space-y-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Building className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                    Quản Lý Chi Nhánh
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý thông tin và hoạt động của các chi nhánh trong hệ thống
                    <Sparkles className='h-3 w-3 text-violet-500' />
                  </p>
                </div>
              </div>
            </div>
            <BranchPrimaryButtons />
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng chi nhánh</p>
                    <p className='text-2xl font-bold text-violet-600 dark:text-violet-400'>{totalBranches}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                    <Building className='h-6 w-6 text-violet-600 dark:text-violet-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Quản lý chi nhánh</p>
                    <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{totalManagers}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <MapPin className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Trung bình giờ hoạt động</p>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{avgOperatingHours}h</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <Clock className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng quản lý</p>
                    <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{totalManagers}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
                    <MapPin className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table */}
        <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
          <CardContent className='p-0'>
            <div className='p-6 space-y-4'>
              <BranchTable data={branchList} />
            </div>
          </CardContent>
        </Card>
      </Main>

      <BranchDialogs />
    </BranchProvider>
  )
}
