import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { useGetAddOns, useGetPositions, useGetSizes } from '@/services/admin/add-on.service'
import { transformAddOnListToSchema, transformPositionToSchema, transformSizeToSchema } from './data/schema'
import { Package, MapPin, Ruler, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { AddOnTable } from './components/add-on-table'
import { PositionTable } from './components/position-table'
import { SizeTable } from './components/size-table'
import { AddOnPrimaryButtons } from './components/add-on-primary-buttons'
import { AddOnDialogs } from './components/add-on-dialogs'
import { AddOnTabs } from './components/add-on-tabs'
import AddOnProvider from './context/add-on-context'

export default function ManageAddOnPage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10
  })

  const { data: addOnsResponse, isLoading: addOnsLoading, error: addOnsError } = useGetAddOns(queryParams)
  const { data: positionsResponse, isLoading: positionsLoading, error: positionsError } = useGetPositions()
  const { data: sizesResponse, isLoading: sizesLoading, error: sizesError } = useGetSizes()

  // Transform API data to component format
  const addOnList = addOnsResponse?.data?.data?.items?.map(transformAddOnListToSchema) || []
  const positionList = positionsResponse?.data?.data?.items?.map(transformPositionToSchema) || []
  const sizeList = sizesResponse?.data?.data?.items?.map(transformSizeToSchema) || []

  // Calculate statistics
  const totalAddOns = addOnList.length
  const totalPositions = positionList.length
  const totalSizes = sizeList.length
  const positionsWithImages = positionList.filter((position) => position.image).length

  const isLoading = addOnsLoading || positionsLoading || sizesLoading
  const hasError = addOnsError || positionsError || sizesError

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center space-y-4'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto'></div>
              <Package className='h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div>
              <p className='text-lg font-medium text-foreground'>Đang tải dữ liệu...</p>
              <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (hasError) {
    const errorMessage = 'Đã xảy ra lỗi khi tải dữ liệu'
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
            <CardContent className='pt-6'>
              <div className='text-center space-y-4'>
                <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                  <Package className='h-8 w-8 text-destructive' />
                </div>
                <div>
                  <p className='text-lg font-semibold text-destructive'>Không thể tải dữ liệu</p>
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
    <AddOnProvider>
      <Main className='space-y-6'>
        {/* Enhanced Header Section */}
        <div className='space-y-6'>
          {/* Title and Actions */}
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg'>
                  <Package className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent'>
                    Quản Lý Add-ons
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý add-ons, positions và sizes của hệ thống
                    <Sparkles className='h-3 w-3 text-blue-500' />
                  </p>
                </div>
              </div>
            </div>
            <AddOnPrimaryButtons />
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng Add-ons</p>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{totalAddOns}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <Package className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng Positions</p>
                    <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{totalPositions}</p>
                    <Progress
                      value={(positionsWithImages / Math.max(totalPositions, 1)) * 100}
                      className='h-1.5 bg-green-100 dark:bg-green-900/30 [&_.progress-indicator]:bg-green-500'
                    />
                  </div>
                  <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <MapPin className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng Sizes</p>
                    <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{totalSizes}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
                    <Ruler className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tỷ lệ tăng trưởng</p>
                    <div className='flex items-baseline gap-2'>
                      <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>+8%</p>
                      <TrendingUp className='h-4 w-4 text-purple-500' />
                    </div>
                    <p className='text-xs text-muted-foreground'>So với tháng trước</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center'>
                    <TrendingUp className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className='border-0 shadow-xl'>
          <CardContent className='p-6'>
            <AddOnTabs
              addOnTable={<AddOnTable data={addOnList} />}
              positionTable={<PositionTable data={positionList} />}
              sizeTable={<SizeTable data={sizeList} />}
            />
          </CardContent>
        </Card>
      </Main>

      <AddOnDialogs />
    </AddOnProvider>
  )
}
