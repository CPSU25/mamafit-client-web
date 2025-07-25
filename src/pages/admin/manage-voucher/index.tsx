import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useVoucherBatch, useVoucherDiscount } from '@/services/admin/manage-voucher.service'
import { transformVoucherBatchToSchema, transformVoucherDiscountToSchema } from './data/schema'
import { voucherBatchColumns } from './components/voucher-batch-columns'
import { voucherDiscountColumns } from './components/voucher-discount-columns'
import { VoucherDialogs } from './components/voucher-dialogs'
import { VoucherPrimaryButtons } from './components/voucher-primary-buttons'
import { VoucherTable } from './components/voucher-table'
import VoucherProvider, { useVoucher } from './contexts/voucher-context'
import { Badge } from '@/components/ui/badge'

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

  // Transform API data to schema format
  const voucherBatchList = voucherBatchResponse?.data?.items?.map(transformVoucherBatchToSchema) || []
  const voucherDiscountList = voucherDiscountResponse?.data?.items?.map(transformVoucherDiscountToSchema) || []

  const isLoading = isLoadingBatch || isLoadingDiscount
  const error = errorBatch || errorDiscount

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Đang tải voucher...</p>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    return (
      <Main>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <p className='text-destructive mb-2'>Không thể tải voucher</p>
            <p className='text-muted-foreground text-sm'>{errorMessage}</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản lý Voucher</h2>
          <p className='text-muted-foreground'>Quản lý lô voucher và voucher giảm giá</p>
        </div>
        <VoucherPrimaryButtons />
      </div>

      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'batch' | 'discount')}>
          <TabsList className='grid w-full grid-cols-2 max-w-[400px]'>
            <TabsTrigger value='batch' className='flex items-center gap-2'>
              <span>Loại Voucher</span>
              <Badge variant='secondary' className='text-xs'>
                {voucherBatchList.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value='discount' className='flex items-center gap-2'>
              <span>Voucher</span>
              <Badge variant='secondary' className='text-xs'>
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
