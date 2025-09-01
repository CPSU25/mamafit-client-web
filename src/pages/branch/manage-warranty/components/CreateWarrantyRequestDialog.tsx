import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Loader2, CreditCard, Banknote, AlertTriangle, Shield, Package } from 'lucide-react'

import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { FirebaseVideoUpload } from '@/components/firebase-video-upload'
import { useCreateBranchWarrantyRequest } from '@/services/global/warranty.service'
import type { OrderItemType } from '@/@types/manage-order.types'
import { PaymentMethod } from '@/@types/manage-order.types'
import { ProductImageViewer } from '@/components/ui/image-viewer'
import { useGetConfigs } from '@/services/global/system-config.service'
import PriceInput from '@/components/ui/price-input'

interface CreateWarrantyRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: OrderItemType[]
  onSuccess: () => void
}

export function CreateWarrantyRequestDialog({
  open,
  onOpenChange,
  selectedItems,
  onSuccess
}: CreateWarrantyRequestDialogProps) {
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [images, setImages] = useState<Record<string, string[]>>({})
  const [videos, setVideos] = useState<Record<string, string[]>>({})
  const [paymentMethod] = useState<PaymentMethod>(PaymentMethod.ONLINE_BANKING)
  const [feeAmount, setFeeAmount] = useState<number>(0)
  const [estimateDays, setEstimateDays] = useState<number | null>(null)

  const { mutateAsync: createRequest, isPending: creating } = useCreateBranchWarrantyRequest()
  const { data: configData } = useGetConfigs()
  const warrantyPeriod = configData?.data.fields.warrantyTime

  // Check if any item needs fee (warranty round >= warrantyPeriod) - memoized to prevent infinite re-renders
  const needsFee = useMemo(() => {
    if (!warrantyPeriod) return false
    return selectedItems.some((item) => {
      const warrantyRound = item.warrantyRound || 0
      return warrantyRound >= warrantyPeriod
    })
  }, [selectedItems, warrantyPeriod])

  const setItemDescription = useCallback((id: string, val: string) => {
    setDescriptions((prev) => ({ ...prev, [id]: val }))
  }, [])

  const setItemImages = useCallback((id: string, urls: string[]) => {
    setImages((prev) => ({ ...prev, [id]: urls }))
  }, [])

  const setItemVideos = useCallback((id: string, urls: string[]) => {
    setVideos((prev) => ({ ...prev, [id]: urls }))
  }, [])

  // const handlePaymentMethodChange = useCallback((value: string) => {
  //   setPaymentMethod(value as PaymentMethod)
  // }, [])

  const handleFeeAmountChange = useCallback((value: number) => {
    setFeeAmount(value)
  }, [])

  const handleEstimateDaysChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const days = value ? Number(value) : null
    
    // Validate: prevent negative numbers
    if (days !== null && days < 0) {
      return
    }
    
    setEstimateDays(days)
  }, [])

  const canCreate = useMemo(() => {
    return selectedItems.length > 0 && (!needsFee || (needsFee && feeAmount > 0))
  }, [selectedItems.length, needsFee, feeAmount])

  const handleCreate = useCallback(async () => {
    try {
      const itemsPayload = selectedItems.map((item) => ({
        orderItemId: item.id,
        description: descriptions[item.id] || '',
        images: images[item.id] || [],
        videos: videos[item.id] || []
      }))

      const estimateTimeISO = estimateDays !== null
        ? (() => {
            const d = new Date()
            if (estimateDays === 0) {
              // If 0 days, set to end of current day (23:59:59)
              d.setHours(23, 59, 59, 999)
            } else if (estimateDays > 0) {
              // If positive days, add days and set to end of that day
              d.setDate(d.getDate() + estimateDays)
              d.setHours(23, 59, 59, 999)
            }
            return d.toISOString()
          })()
        : null

      await createRequest({
        paymentMethod,
        fee: needsFee && feeAmount > 0 ? feeAmount : null,
        items: itemsPayload,
        estimateTime: estimateTimeISO
      })

      // Reset form
      setDescriptions({})
      setImages({})
      setVideos({})
      setFeeAmount(0)
      setEstimateDays(null)

      onSuccess()
    } catch (error) {
      console.error('Error creating warranty request:', error)
    }
  }, [selectedItems, descriptions, images, videos, paymentMethod, needsFee, feeAmount, estimateDays, createRequest, onSuccess])

  const handleClose = useCallback(() => {
    setDescriptions({})
    setImages({})
    setVideos({})
          setFeeAmount(0)
    setEstimateDays(null)
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2'>
            <Shield className='h-5 w-5 text-violet-600' />
            Tạo yêu cầu bảo hành
          </DialogTitle>
          <DialogDescription>Điền thông tin chi tiết cho các sản phẩm cần bảo hành</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Selected Items Summary */}
          <Card className='border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/20'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <Package className='h-5 w-5 text-violet-600' />
                  <span className='font-medium'>Sản phẩm đã chọn</span>
                  <Badge
                    variant='secondary'
                    className='bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400'
                  >
                    {selectedItems.length} sản phẩm
                  </Badge>
                </div>
                {needsFee && (
                  <Badge
                    variant='outline'
                    className='border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                  >
                    Có phí bảo hành
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Details Form */}
          <div className='space-y-6'>
            {selectedItems.map((item, index) => {
              const warrantyRound = item.warrantyRound || 0
              const needsFeeForItem = warrantyPeriod ? warrantyRound >= warrantyPeriod : false

              return (
                <Card key={item.id} className='border border-border/50'>
                  <CardContent className='p-6'>
                    <div className='space-y-4'>
                      {/* Item Header */}
                      <div className='flex items-start gap-4'>
                        {/* Product Image */}
                        <div className='flex-shrink-0'>
                          {item.maternityDressDetail?.image ||
                          (item.preset?.images && item.preset.images.length > 0) ? (
                            <ProductImageViewer
                              src={item.maternityDressDetail?.image?.[0] || item.preset?.images?.[0] || ''}
                              alt={item.preset?.name || item.maternityDressDetail?.name || 'product'}
                              containerClassName='h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0 border'
                              imgClassName='!w-full !h-full !object-cover'
                              fit='cover'
                              thumbnailClassName='h-16 w-16'
                            />
                          ) : (
                            <div className='w-16 h-16 bg-muted rounded-lg border flex items-center justify-center'>
                              <Package className='h-8 w-8 text-muted-foreground' />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between mb-3'>
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                {item.preset?.sku && (
                                  <Badge
                                    variant='outline'
                                    className='font-mono text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                                  >
                                    {item.preset.sku}
                                  </Badge>
                                )}
                                {item.maternityDressDetail?.sku && (
                                  <Badge
                                    variant='outline'
                                    className='font-mono text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800'
                                  >
                                    {item.maternityDressDetail.sku}
                                  </Badge>
                                )}
                              </div>
                              <h3 className='text-lg font-semibold text-foreground'>
                                {item.preset?.name || item.maternityDressDetail?.name}
                              </h3>
                            </div>
                            <Badge
                              variant='secondary'
                              className='text-xs bg-violet-100 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400'
                            >
                              Sản phẩm {index + 1}
                            </Badge>
                          </div>

                          {/* Product Details */}
                          <div className='flex flex-wrap gap-2 text-xs'>
                            {item.maternityDressDetail?.color && (
                              <span className='bg-muted px-2 py-1 rounded-md text-muted-foreground'>
                                Màu: {item.maternityDressDetail.color}
                              </span>
                            )}
                            {item.maternityDressDetail?.size && (
                              <span className='bg-muted px-2 py-1 rounded-md text-muted-foreground'>
                                Size: {item.maternityDressDetail.size}
                              </span>
                            )}
                            <span className='bg-muted px-2 py-1 rounded-md text-muted-foreground'>
                              SL: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Warranty Info */}
                      <div className='flex items-center gap-4 text-sm p-3 bg-muted/30 rounded-lg border'>
                       
                        <div
                          className={`flex items-center gap-2 ${needsFeeForItem ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                        >
                          <Shield className='h-4 w-4' />
                          <span className='font-medium'>Đã được bảo hành: {warrantyRound} lần</span>
                          
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className='space-y-4 pt-4 border-t'>
                        {/* Problem Description */}
                        <div className='space-y-2'>
                          <Label className='text-sm font-medium'>Mô tả lỗi/vấn đề *</Label>
                          <Textarea
                            placeholder='Mô tả chi tiết vấn đề cần bảo hành...'
                            value={descriptions[item.id] || ''}
                            onChange={(e) => setItemDescription(item.id, e.target.value)}
                            className='min-h-[80px] resize-none'
                          />
                        </div>

                        {/* Images Upload */}
                        <div className='space-y-2'>
                          <Label className='text-sm font-medium'>Hình ảnh minh chứng</Label>
                          <CloudinaryImageUpload
                            value={images[item.id] || []}
                            onChange={(urls) => setItemImages(item.id, urls)}
                            maxFiles={5}
                          />
                        </div>

                        {/* Video Upload */}
                        <div className='space-y-2'>
                          <Label className='text-sm font-medium'>
                            Video minh chứng (tùy chọn)
                            <span className='text-xs text-muted-foreground ml-2'>
                              MP4, WebM, AVI • Tối đa 100MB/video
                            </span>
                          </Label>
                          <FirebaseVideoUpload
                            value={videos[item.id] || []}
                            onChange={(urls) => setItemVideos(item.id, urls)}
                            maxFiles={3}
                            placeholder='Kéo thả video vào đây hoặc nhấp để chọn'
                            className='border-dashed border-violet-200 hover:border-violet-300 bg-violet-50/30 dark:border-violet-800 dark:hover:border-violet-700 dark:bg-violet-950/10'
                            uploadOptions={{
                              folder: 'warranty-videos/',
                              fileName: `warranty-${item.id}-video`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Estimate Time (Days) */}
          <div className='space-y-3'>
            <div>
              <Label className='text-sm font-medium'>⏱️ Thời gian ước tính (ngày)</Label>
              <Input
                type='number'
                placeholder='Ví dụ: 7'
                min='1'
                max='30'
                value={estimateDays ?? ''}
                onChange={handleEstimateDaysChange}
                className='mt-2'
              />
              <p className='text-xs text-muted-foreground mt-1'>Không bắt buộc. Từ 1-30 ngày làm việc.</p>
            </div>

            {typeof estimateDays === 'number' && estimateDays > 0 && (
              <div className='p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm'>
                Dự kiến hoàn thành: {(() => {
                  const d = new Date()
                  d.setDate(d.getDate() + (estimateDays || 0))
                  return d.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                })()}
              </div>
            )}
          </div>

          {/* Fee Management Section */}
          {needsFee && (
            <Card className='border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/10'>
              <CardContent className='p-6 space-y-4'>
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-5 w-5 text-amber-600' />
                  <div className='font-semibold text-amber-700 dark:text-amber-400'>Thanh toán & Phí bảo hành</div>
                </div>

                {/* Fee Amount Input */}

                <div className='space-y-3'>
                  <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription className='text-amber-800 dark:text-amber-400'>
                      Có sản phẩm yêu cầu bảo hành lần thứ {warrantyPeriod} trở đi. Vui lòng nhập số tiền phí cần thu.
                    </AlertDescription>
                  </Alert>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Số tiền phí *</Label>
                    <div className='relative'>
                      <Banknote className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <PriceInput
                        placeholder='Nhập số tiền phí...'
                        value={feeAmount}
                        onChange={handleFeeAmountChange}
                        className='pl-10'
                      />
                      <div className='absolute right-3 top-3 text-sm text-muted-foreground'>VNĐ</div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {/* <div className='space-y-2'>
                  <Label className='text-sm font-medium'>Phương thức thanh toán</Label>
                  <Select value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                    <SelectTrigger className='bg-white dark:bg-background'>
                      <SelectValue placeholder='Chọn phương thức thanh toán' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.CASH}>
                        <div className='flex items-center gap-2'>
                          <Banknote className='h-4 w-4' />
                          Tiền mặt
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethod.ONLINE_BANKING}>
                        <div className='flex items-center gap-2'>
                          <CreditCard className='h-4 w-4' />
                          Chuyển khoản
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleClose} disabled={creating}>
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className='bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
          >
            {creating ? <Loader2 className='h-4 w-4 mr-2 animate-spin' /> : <PlusCircle className='h-4 w-4 mr-2' />}
            {creating ? 'Đang tạo...' : 'Tạo yêu cầu bảo hành'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
