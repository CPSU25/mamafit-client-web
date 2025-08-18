import { useMemo, useState } from 'react'
import { Shield, Search, PlusCircle } from 'lucide-react'

import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'

import { useFindOrder } from '@/services/admin/manage-order.service'
import { useCreateBranchWarrantyRequest, useWarrantyRequestList } from '@/services/global/warranty.service'

import type { OrderItemType } from '@/@types/manage-order.types'
import { PaymentMethod } from '@/@types/manage-order.types'

// Simple card for listing existing warranty requests of the branch
function BranchWarrantyRequests() {
  const { data, isLoading, error, refetch } = useWarrantyRequestList({
    page: 1,
    limit: 50,
    search: '',
    sortBy: 'CREATED_AT_DESC'
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yêu cầu bảo hành gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='h-14 rounded-md bg-muted animate-pulse' />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant='destructive'>
        <AlertDescription>
          Không thể tải danh sách yêu cầu bảo hành. Vui lòng thử lại.
          <Button size='sm' variant='secondary' className='ml-2' onClick={() => refetch()}>
            Tải lại
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const items = data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yêu cầu bảo hành gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Chưa có yêu cầu bảo hành nào.</p>
        ) : (
          <div className='divide-y rounded-md border'>
            {items.map((r) => (
              <div key={r.id} className='p-4 flex items-center justify-between'>
                <div className='space-y-1'>
                  <div className='font-medium'>SKU: {r.sku}</div>
                  <div className='text-xs text-muted-foreground'>
                    Khách hàng: {r.customer.fullName} • {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className='text-xs px-2 py-1 rounded bg-muted'>{r.status}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FindAndCreateWarranty() {
  const [sku, setSku] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [videos, setVideos] = useState<Record<string, string[]>>({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)

  const canSearch = sku.trim().length > 0 && orderCode.trim().length > 0
  const { data, isFetching, refetch, error, isError } = useFindOrder(sku, orderCode, { enabled: canSearch })
  const order = data?.data

  const matchingItems = useMemo(() => {
    if (!order) return [] as OrderItemType[]
    // If API returns all items of the order, prefer showing items that match SKU first
    const items = order.items ?? []
    const matched = items.filter(
      (i) =>
        i.maternityDressDetail?.id === sku ||
        i.maternityDressDetail?.name?.includes(sku) ||
        i.maternityDressDetail?.color?.includes(sku)
    )
    return matched.length > 0 ? matched : items
  }, [order, sku])

  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const setItemDescription = (id: string, val: string) => setDescriptions((prev) => ({ ...prev, [id]: val }))
  const setItemImages = (id: string, urls: string[]) => setImages((prev) => ({ ...prev, [id]: urls }))
  const setItemVideos = (id: string, urls: string[]) => setVideos((prev) => ({ ...prev, [id]: urls }))

  const { mutateAsync: createRequest, isPending: creating } = useCreateBranchWarrantyRequest()

  const canCreate = selectedItemIds.length > 0 && !creating

  const handleCreate = async () => {
    if (!order) return
    const itemsPayload = selectedItemIds.map((id) => ({
      orderItemId: id,
      description: descriptions[id] || '',
      images: images[id] || [],
      videos: videos[id] || []
    }))
    await createRequest({ paymentMethod, items: itemsPayload })
    // reset minimal states except search
    setSelectedItemIds([])
    setDescriptions({})
    setImages({})
    setVideos({})
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-violet-600' />
              Tạo yêu cầu bảo hành tại cửa hàng
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Tìm đơn hàng bằng SKU sản phẩm và mã đơn để tạo yêu cầu bảo hành.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Search row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <div className='space-y-2'>
            <Label>SKU sản phẩm</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder='VD: SKU123' />
          </div>
          <div className='space-y-2'>
            <Label>Mã đơn hàng</Label>
            <Input value={orderCode} onChange={(e) => setOrderCode(e.target.value)} placeholder='VD: ORD-0001' />
          </div>
          <div className='flex items-end'>
            <Button className='w-full md:w-auto' onClick={() => refetch()} disabled={!canSearch || isFetching}>
              <Search className='h-4 w-4 mr-2' />
              {isFetching ? 'Đang tìm...' : 'Tìm đơn hàng'}
            </Button>
          </div>
        </div>

        {isError && (
          <Alert variant='destructive'>
            <AlertDescription>
              {(error as Error)?.message || 'Không tìm thấy đơn hàng phù hợp. Kiểm tra SKU và mã đơn.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {order && (
          <div className='space-y-4'>
            <div className='rounded-md border p-4'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='space-y-1'>
                  <div className='text-sm text-muted-foreground'>Mã đơn</div>
                  <div className='font-medium'>{order.code}</div>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm text-muted-foreground'>Trạng thái</div>
                  <div className='text-xs px-2 py-1 rounded bg-muted inline-block'>{order.status}</div>
                </div>
                <div className='space-y-1'>
                  <div className='text-sm text-muted-foreground'>Tổng tiền</div>
                  <div className='font-medium'>{(order.totalAmount ?? 0).toLocaleString('vi-VN')}₫</div>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='font-medium'>Chọn sản phẩm cần bảo hành</div>
              <div className='space-y-4'>
                {matchingItems.map((item) => (
                  <div key={item.id} className='rounded-md border p-4'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div className='font-medium'>{item.maternityDressDetail?.name}</div>
                          <Button
                            variant={selectedItemIds.includes(item.id) ? 'secondary' : 'outline'}
                            size='sm'
                            onClick={() => toggleItem(item.id)}
                          >
                            {selectedItemIds.includes(item.id) ? 'Đã chọn' : 'Chọn'}
                          </Button>
                        </div>
                        <div className='text-xs text-muted-foreground mt-1'>
                          Màu: {item.maternityDressDetail?.color} • Size: {item.maternityDressDetail?.size} • SL:{' '}
                          {item.quantity}
                          {item.price ? ` • Giá: ${Number(item.price).toLocaleString('vi-VN')}₫` : ''}
                          {item.warrantyDate
                            ? ` • BH đến: ${new Date(item.warrantyDate).toLocaleDateString('vi-VN')}`
                            : ''}
                          {item.warrantyNumber ? ` • Số BH: ${item.warrantyNumber}` : ''}
                        </div>

                        {/* Preset info (nếu có) */}
                        {item.preset && (
                          <div className='mt-3 rounded-md border bg-muted/30 p-3'>
                            <div className='flex items-center justify-between'>
                              <div className='text-sm font-medium'>
                                Preset: {item.preset?.styleName || item.preset?.name}
                              </div>
                              {typeof item.preset?.price === 'number' && (
                                <div className='text-xs text-muted-foreground'>
                                  Giá preset: {Number(item.preset.price).toLocaleString('vi-VN')}₫
                                </div>
                              )}
                            </div>
                            {Array.isArray(item.preset?.images) && item.preset!.images.length > 0 && (
                              <div className='mt-2 grid grid-cols-3 gap-2'>
                                {item.preset!.images.slice(0, 6).map((url, idx) => (
                                  <div key={idx} className='aspect-square overflow-hidden rounded border bg-background'>
                                    <img src={url} alt={`preset-${idx}`} className='h-full w-full object-cover' />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Hình ảnh sản phẩm */}
                        {Array.isArray(item.maternityDressDetail?.images) &&
                          item.maternityDressDetail!.images.length > 0 && (
                            <div className='mt-3'>
                              <div className='text-xs text-muted-foreground mb-2'>Hình ảnh sản phẩm</div>
                              <div className='grid grid-cols-3 gap-2'>
                                {item.maternityDressDetail!.images.slice(0, 6).map((url, idx) => (
                                  <div key={idx} className='aspect-square overflow-hidden rounded border bg-background'>
                                    <img src={url} alt={`product-${idx}`} className='h-full w-full object-cover' />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {selectedItemIds.includes(item.id) && (
                          <div className='mt-4 space-y-3'>
                            <div className='space-y-2'>
                              <Label>Mô tả lỗi/vấn đề</Label>
                              <Input
                                placeholder='Mô tả ngắn gọn vấn đề cần bảo hành'
                                value={descriptions[item.id] || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setItemDescription(item.id, e.target.value)
                                }
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label>Hình ảnh</Label>
                              <CloudinaryImageUpload
                                value={images[item.id] || []}
                                onChange={(urls) => setItemImages(item.id, urls)}
                                maxFiles={5}
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label>Video (tùy chọn — nhập URL nếu có)</Label>
                              {/* Keep simple: allow adding URLs via the same component but accept only video; Cloudinary config may not support video in this project */}
                              <CloudinaryImageUpload
                                value={videos[item.id] || []}
                                onChange={(urls) => setItemVideos(item.id, urls)}
                                maxFiles={2}
                                accept='video/*'
                                placeholder='Thêm URL video hoặc upload nếu được cấu hình'
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {matchingItems.length === 0 && (
                  <div className='text-sm text-muted-foreground'>Không có sản phẩm nào trong đơn.</div>
                )}
              </div>
            </div>

            <Separator />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Phương thức thanh toán (nếu có phí)</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn phương thức' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='CASH'>Tiền mặt</SelectItem>
                    <SelectItem value='ONLINE_BANKING'>Chuyển khoản</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='flex justify-end'>
              <Button onClick={handleCreate} disabled={!canCreate}>
                <PlusCircle className='h-4 w-4 mr-2' /> Tạo yêu cầu bảo hành
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BranchManageWarrantyContent() {
  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Shield className='h-6 w-6 text-violet-600' />
            <h1 className='text-2xl font-bold tracking-tight'>Quản lý bảo hành (Chi nhánh)</h1>
          </div>
          <p className='text-muted-foreground'>Tạo yêu cầu bảo hành trực tiếp tại cửa hàng và theo dõi các yêu cầu.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <FindAndCreateWarranty />
        </div>
        <div className='space-y-6'>
          <BranchWarrantyRequests />
        </div>
      </div>
    </div>
  )
}

export default function ManageBranchWarrantyPage() {
  return (
    <Main className='min-h-screen p-0 bg-gradient-to-br from-violet-50/30 via-white to-purple-50/20 dark:from-violet-950/10 dark:via-background dark:to-purple-950/10'>
      <BranchManageWarrantyContent />
    </Main>
  )
}
