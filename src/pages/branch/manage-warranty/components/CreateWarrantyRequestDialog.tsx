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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle, Loader2, CreditCard, Banknote, AlertTriangle, Calendar, Shield, Package } from 'lucide-react'

import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { FirebaseVideoUpload } from '@/components/firebase-video-upload'
import { useCreateBranchWarrantyRequest } from '@/services/global/warranty.service'
import type { OrderItemType } from '@/@types/manage-order.types'
import { PaymentMethod } from '@/@types/manage-order.types'
import { useGetConfigs } from '@/services/global/system-config.service'

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [feeAmount, setFeeAmount] = useState<number | null>(null)

  const { mutateAsync: createRequest, isPending: creating } = useCreateBranchWarrantyRequest()
  const { data: configData } = useGetConfigs()
  const warrantyPeriod = configData?.data.fields.warrantyTime
  console.log('hi', warrantyPeriod)
  // Check if any item needs fee (warranty round >= 2) - memoized to prevent infinite re-renders
  const needsFee = useMemo(() => {
    return selectedItems.some((item) => {
      const warrantyRound = item.warrantyRound || 1
      return warrantyRound >= (warrantyPeriod as number)
    })
  }, [selectedItems])

  const setItemDescription = useCallback((id: string, val: string) => {
    setDescriptions((prev) => ({ ...prev, [id]: val }))
  }, [])

  const setItemImages = useCallback((id: string, urls: string[]) => {
    setImages((prev) => ({ ...prev, [id]: urls }))
  }, [])

  const setItemVideos = useCallback((id: string, urls: string[]) => {
    setVideos((prev) => ({ ...prev, [id]: urls }))
  }, [])

  const handlePaymentMethodChange = useCallback((value: string) => {
    setPaymentMethod(value as PaymentMethod)
  }, [])

  const handleFeeAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFeeAmount(e.target.value ? Number(e.target.value) : null)
  }, [])

  const canCreate = useMemo(() => {
    return selectedItems.length > 0 && (!needsFee || (needsFee && feeAmount !== null))
  }, [selectedItems.length, needsFee, feeAmount])

  const handleCreate = useCallback(async () => {
    try {
      const itemsPayload = selectedItems.map((item) => ({
        orderItemId: item.id,
        description: descriptions[item.id] || '',
        images: images[item.id] || [],
        videos: videos[item.id] || []
      }))

      await createRequest({
        paymentMethod,
        fee: needsFee ? feeAmount : null,
        items: itemsPayload
      })

      // Reset form
      setDescriptions({})
      setImages({})
      setVideos({})
      setFeeAmount(null)

      onSuccess()
    } catch (error) {
      console.error('Error creating warranty request:', error)
    }
  }, [selectedItems, descriptions, images, videos, paymentMethod, needsFee, feeAmount, createRequest, onSuccess])

  const handleClose = useCallback(() => {
    setDescriptions({})
    setImages({})
    setVideos({})
    setFeeAmount(null)
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
              const warrantyRound = item.warrantyRound || 1
              const needsFeeForItem = warrantyRound >= 2

              return (
                <Card key={item.id} className='border border-border/50'>
                  <CardContent className='p-6'>
                    <div className='space-y-4'>
                      {/* Item Header */}
                      <div className='flex items-start justify-between'>
                        <div className='space-y-2'>
                          <div className='font-semibold text-lg'>
                            {item.preset?.name || item.maternityDressDetail?.name}
                          </div>
                          <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
                            <span className='bg-muted px-2 py-1 rounded'>Màu: {item.maternityDressDetail?.color}</span>
                            <span className='bg-muted px-2 py-1 rounded'>Size: {item.maternityDressDetail?.size}</span>
                            <span className='bg-muted px-2 py-1 rounded'>SL: {item.quantity}</span>
                          </div>
                        </div>
                        <Badge variant='outline' className='text-xs'>
                          Sản phẩm {index + 1}
                        </Badge>
                      </div>

                      {/* Warranty Info */}
                      <div className='flex items-center gap-4 text-sm'>
                        {item.warrantyDate && (
                          <div className='flex items-center gap-1 text-blue-600 dark:text-blue-400'>
                            <Calendar className='h-4 w-4' />
                            <span>BH đến: {new Date(item.warrantyDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                        <div
                          className={`flex items-center gap-1 ${needsFeeForItem ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                        >
                          <Shield className='h-4 w-4' />
                          <span>Lần BH: {warrantyRound}</span>
                          {needsFeeForItem && (
                            <Badge
                              variant='outline'
                              className='ml-1 text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                            >
                              Có phí
                            </Badge>
                          )}
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

          {/* Fee Management Section */}
          <Card className='border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/10'>
            <CardContent className='p-6 space-y-4'>
              <div className='flex items-center gap-2'>
                <CreditCard className='h-5 w-5 text-amber-600' />
                <div className='font-semibold text-amber-700 dark:text-amber-400'>Thanh toán & Phí bảo hành</div>
              </div>

              {/* Fee Amount Input */}
              {needsFee && (
                <div className='space-y-3'>
                  <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'>
                    <AlertTriangle className='h-4 w-4' />
                    <AlertDescription className='text-amber-800 dark:text-amber-400'>
                      Có sản phẩm yêu cầu bảo hành lần thứ 2 trở đi. Vui lòng nhập số tiền phí cần thu.
                    </AlertDescription>
                  </Alert>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Số tiền phí *</Label>
                    <div className='relative'>
                      <Banknote className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        type='number'
                        placeholder='Nhập số tiền phí...'
                        value={feeAmount || ''}
                        onChange={handleFeeAmountChange}
                        className='pl-10'
                      />
                      <div className='absolute right-3 top-3 text-sm text-muted-foreground'>VNĐ</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className='space-y-2'>
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
              </div>
            </CardContent>
          </Card>
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
