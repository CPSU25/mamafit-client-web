import { useMemo, useState } from 'react'
import { Ticket, Sparkles } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useVoucherBatch, useVoucherDiscount } from '@/services/admin/manage-voucher.service'
import { transformVoucherBatchToSchema, transformVoucherDiscountToSchema } from './data/schema'
import { voucherBatchColumns } from './components/voucher-batch-columns'
import { voucherDiscountColumns } from './components/voucher-discount-columns'
import { VoucherDialogs } from './components/voucher-dialogs'
import { VoucherPrimaryButtons } from './components/voucher-primary-buttons'
import { VoucherTable } from './components/voucher-table'
import VoucherProvider, { useVoucher } from './contexts/voucher-context'

// Voucher Loading skeleton theo pattern dự án
const VoucherPageSkeleton = () => (
  <Main>
    <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
      <div className='text-center space-y-4'>
        <div className='relative'>
          <div className='animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto'></div>
          <Ticket className='h-8 w-8 text-purple-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
        </div>
        <div>
          <p className='text-lg font-medium text-foreground'>Đang tải khuyến mãi...</p>
          <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    </div>
  </Main>
)

// Voucher Error state theo pattern dự án
const VoucherPageError = ({ error }: { error: unknown }) => {
  const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'

  return (
    <Main>
      <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
        <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-4'>
              <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                <Ticket className='h-8 w-8 text-destructive' />
              </div>
              <div>
                <p className='text-lg font-semibold text-destructive'>Không thể tải khuyến mãi</p>
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

function ManageVoucherContent() {
  const { activeTab, setActiveTab } = useVoucher()
  const [queryParams] = useState({
    index: 0,
    pageSize: 100
  })

  const { data: voucherBatchResponse, isLoading: isLoadingBatch, error: errorBatch } = useVoucherBatch(queryParams)

  const {
    data: voucherDiscountResponse,
    isLoading: isLoadingDiscount,
    error: errorDiscount
  } = useVoucherDiscount(queryParams)

  // Transform API data to schema format với memoization
  const voucherBatchList = useMemo(
    () => voucherBatchResponse?.data?.items?.map(transformVoucherBatchToSchema) || [],
    [voucherBatchResponse?.data?.items]
  )

  const voucherDiscountList = useMemo(
    () => voucherDiscountResponse?.data?.items?.map(transformVoucherDiscountToSchema) || [],
    [voucherDiscountResponse?.data?.items]
  )

  const isLoading = isLoadingBatch || isLoadingDiscount
  const error = errorBatch || errorDiscount

  // Loading state
  if (isLoading) {
    return <VoucherPageSkeleton />
  }

  // Error state
  if (error) {
    return <VoucherPageError error={error} />
  }

  return (
    <Main className='space-y-6'>
      {/* Header theo pattern dự án */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg'>
              <Ticket className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent'>
                Quản Lý Khuyến Mãi
              </h1>
              <p className='text-sm text-muted-foreground flex items-center gap-1'>
                Quản lý lô khuyến mãi và khuyến mãi giảm giá
                <Sparkles className='h-3 w-3 text-purple-500' />
              </p>
            </div>
          </div>
        </div>
        <VoucherPrimaryButtons />
      </div>

      {/* Voucher Table với Tabs */}
      <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/10'>
        <CardContent className='p-0'>
          <div className='p-6 space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <CardTitle className='text-lg font-semibold'>Danh sách Voucher</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  Quản lý các loại voucher và voucher giảm giá trong hệ thống
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'batch' | 'discount')}
              className='space-y-4'
            >
              <TabsList className='grid w-full grid-cols-2 max-w-[400px] bg-purple-50 dark:bg-purple-950/20'>
                <TabsTrigger
                  value='batch'
                  className='flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/50 dark:data-[state=active]:text-purple-300'
                >
                  <span>Loại Voucher</span>
                  <Badge
                    variant='secondary'
                    className='text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  >
                    {voucherBatchList.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value='discount'
                  className='flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 dark:data-[state=active]:bg-purple-900/50 dark:data-[state=active]:text-purple-300'
                >
                  <span>Voucher</span>
                  <Badge
                    variant='secondary'
                    className='text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                  >
                    {voucherDiscountList.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='batch' className='space-y-4'>
                <VoucherTable data={voucherBatchList} columns={voucherBatchColumns} />
              </TabsContent>

              <TabsContent value='discount' className='space-y-4'>
                <VoucherTable data={voucherDiscountList} columns={voucherDiscountColumns} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <VoucherDialogs />
    </Main>
  )
}

export default function ManageVoucherPage() {
  return (
    <VoucherProvider>
      <ManageVoucherContent />
    </VoucherProvider>
  )
}
