import { useState } from 'react'
import { Search, Package, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFindOrder } from '@/services/admin/manage-order.service'
import { useSimpleOrderSearch } from '../contexts/OrderSearchContextSimple'

// Simplified Order Search Component
export function OrderSearchSection() {
  const [localSku, setLocalSku] = useState('')
  const [localOrderCode, setLocalOrderCode] = useState('')

  const { setSku, setOrderCode, setOrder } = useSimpleOrderSearch()

  const canSearch = localSku.trim().length > 0 && localOrderCode.trim().length > 0
  const { data, isFetching, refetch, error, isError } = useFindOrder(localSku, localOrderCode, { enabled: false })
  const order = data?.data

  const handleSearch = async () => {
    if (!canSearch) return

    try {
      const result = await refetch()
      const foundOrder = result.data?.data
      if (foundOrder) {
        // Manual context update - no useEffect needed
        setOrder(foundOrder)
        setSku(localSku)
        setOrderCode(localOrderCode)
      }
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  return (
    <Card className='border-0 bg-gradient-to-br from-violet-50/50 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/10'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600'>
            <Search className='h-5 w-5 text-white' />
          </div>
          <div>
            <CardTitle className='text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
              Tìm kiếm đơn hàng
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-1'>
              Nhập SKU sản phẩm và mã đơn hàng để chọn sản phẩm cần bảo hành
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Search Form */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='sku' className='text-sm font-medium'>
              SKU sản phẩm
            </Label>
            <Input
              id='sku'
              placeholder='Nhập SKU sản phẩm...'
              value={localSku}
              onChange={(e) => setLocalSku(e.target.value)}
              className='bg-white dark:bg-background'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='orderCode' className='text-sm font-medium'>
              Mã đơn hàng
            </Label>
            <Input
              id='orderCode'
              placeholder='Nhập mã đơn hàng...'
              value={localOrderCode}
              onChange={(e) => setLocalOrderCode(e.target.value)}
              className='bg-white dark:bg-background'
            />
          </div>
        </div>

        <Button
          onClick={handleSearch}
          disabled={!canSearch || isFetching}
          className='w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
        >
          <Search className='h-4 w-4 mr-2' />
          {isFetching ? 'Đang tìm kiếm...' : 'Tìm kiếm đơn hàng'}
        </Button>

        {/* Error Display */}
        {isError && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              {error &&
              typeof error === 'object' &&
              'response' in error &&
              error.response &&
              typeof error.response === 'object' &&
              'data' in error.response &&
              error.response.data &&
              typeof error.response.data === 'object' &&
              'message' in error.response.data
                ? String(error.response.data.message)
                : 'Không tìm thấy đơn hàng với thông tin đã nhập'}
            </AlertDescription>
          </Alert>
        )}

        {/* Order Summary */}
        {order && (
          <Card className='border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Package className='h-5 w-5 text-emerald-600' />
                  <div>
                    <p className='font-medium'>Đơn hàng: {order.code}</p>
                    <p className='text-sm text-muted-foreground'>
                      {order.items?.length || 0} sản phẩm • Trạng thái: {order.status}
                    </p>
                  </div>
                </div>
                <Badge
                  variant='outline'
                  className='border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400'
                >
                  Tìm thấy
                </Badge>
              </div>
              {order.totalAmount && (
                <p className='text-sm text-muted-foreground mt-2'>
                  Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')} ₫
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
