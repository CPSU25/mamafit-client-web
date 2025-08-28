import { useMemo } from 'react'
import { Package, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreateWarrantyRequestDialog } from './CreateWarrantyRequestDialog'
import { useSimpleOrderSearch } from '../contexts/OrderSearchContextSimple'
import type { OrderItemType } from '@/@types/manage-order.types'
import { ProductImageViewer } from '@/components/ui/image-viewer'

// Product Selection Sidebar Component - Simplified version
export function ProductSelectionSidebar() {
  const { order, sku, selectedItems, setSelectedItems, showCreateDialog, setShowCreateDialog } = useSimpleOrderSearch()

  // Filter items based on SKU search
  const matchingItems = useMemo(() => {
    if (!order?.items) return []

    const items = order.items
    if (!sku.trim()) return items

    // Filter by SKU or product details
    const filtered = items.filter(
      (item: OrderItemType) =>
        item.maternityDressDetail?.id?.includes(sku) ||
        item.maternityDressDetail?.name?.toLowerCase().includes(sku.toLowerCase()) ||
        item.maternityDressDetail?.color?.toLowerCase().includes(sku.toLowerCase()) ||
        item.preset?.name?.toLowerCase().includes(sku.toLowerCase())
    )

    return filtered.length > 0 ? filtered : items
  }, [order, sku])

  const toggleItem = (item: OrderItemType) => {
    setSelectedItems((prev: OrderItemType[]) => {
      const exists = prev.find((i: OrderItemType) => i.id === item.id)
      if (exists) {
        return prev.filter((i: OrderItemType) => i.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }

  const handleCreateSuccess = () => {
    setSelectedItems([])
    setShowCreateDialog(false)
  }

  return (
    <>
      <Card className='border-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600'>
              <Package className='h-5 w-5 text-white' />
            </div>
            <div>
              <CardTitle className='text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                Chọn sản phẩm bảo hành
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>Chọn sản phẩm từ đơn hàng để tạo yêu cầu bảo hành</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {matchingItems.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <Package className='h-12 w-12 mx-auto mb-4 opacity-50' />
              <p className='text-sm'>Chưa tìm thấy sản phẩm</p>
              <p className='text-xs mt-1'>Vui lòng tìm kiếm đơn hàng trước</p>
            </div>
          ) : (
            <>
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {matchingItems.map((item) => {
                  const isSelected = selectedItems.some((selected) => selected.id === item.id)
                  const warrantyRound = item.warrantyRound || 1
                  const needsFee = warrantyRound >= 2

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/20'
                          : 'border-gray-200 hover:border-violet-200 dark:border-gray-700 dark:hover:border-violet-700'
                      }`}
                      onClick={() => toggleItem(item)}
                    >
                      <div className='space-y-2'>
                        <div className='flex items-start gap-3'>
                          <ProductImageViewer
                            src={item.maternityDressDetail?.image?.[0] || item.preset?.images?.[0] || ''}
                            alt={item.preset?.name || item.maternityDressDetail?.name || 'product'}
                            containerClassName='h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0'
                            imgClassName='!w-full !h-full !object-cover'
                            fit='cover'
                            thumbnailClassName='h-12 w-12'
                          />
                          <div className='space-y-1'>
                            <div className='font-medium'>{item.preset?.name || item.maternityDressDetail?.name}</div>
                            <div className='text-sm text-muted-foreground'>
                              SKU: {item.preset?.sku || item.maternityDressDetail?.sku}
                            </div>
                          </div>
                        </div>
                        <div className='flex flex-wrap gap-2 text-xs'>
                          {item.maternityDressDetail?.color && (
                            <span className='bg-muted px-2 py-1 rounded'>Màu: {item.maternityDressDetail.color}</span>
                          )}
                          {item.maternityDressDetail?.size && (
                            <span className='bg-muted px-2 py-1 rounded'>Size: {item.maternityDressDetail.size}</span>
                          )}
                          <span className='bg-muted px-2 py-1 rounded'>SL: {item.quantity}</span>
                          {needsFee && (
                            <span className='bg-amber-100 text-amber-800 px-2 py-1 rounded dark:bg-amber-900/30 dark:text-amber-400'>
                              Có phí
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedItems.length > 0 && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className='w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Tạo yêu cầu bảo hành ({selectedItems.length})
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {showCreateDialog && (
        <CreateWarrantyRequestDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          selectedItems={selectedItems}
          onSuccess={handleCreateSuccess}
        />
      )}
    </>
  )
}
