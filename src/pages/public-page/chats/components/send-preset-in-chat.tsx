import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, Plus, Send, Heart, Sparkles, Camera, DollarSign, Eye, Trash2, Gift, User, Check } from 'lucide-react'
import { CloudinarySingleImageUpload } from '@/components/cloudinary-single-image-upload'
import { useSendPresetToCustomer } from '@/hooks/use-designer-tasks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/utils'

interface SendPresetInChatProps {
  isOpen: boolean
  onClose: () => void
  designRequestId: string
  orderId: string
  customerName?: string | null
}

export function SendPresetInChat({ isOpen, onClose, designRequestId, orderId, customerName }: SendPresetInChatProps) {
  // Custom preset fields
  const [customImages, setCustomImages] = useState<string[]>([])
  const [customPrice, setCustomPrice] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  // Hooks
  const sendPresetMutation = useSendPresetToCustomer()

  const handleAddImage = (url: string) => {
    if (url && !customImages.includes(url)) {
      setCustomImages((prev) => [...prev, url])
      toast.success('Đã thêm hình ảnh thành công! ✨')
    }
  }

  const handleRemoveImage = (index: number) => {
    setCustomImages((prev) => prev.filter((_, i) => i !== index))
    setSelectedImageIndex(null)
    toast.success('Đã xóa hình ảnh')
  }

  const handleSendCustomPreset = async () => {
    if (customImages.length === 0) {
      toast.error('Vui lòng thêm ít nhất một hình ảnh thiết kế 📸')
      return
    }

    if (!customPrice || isNaN(Number(customPrice)) || Number(customPrice) <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ 💰')
      return
    }

    try {
      await sendPresetMutation.mutateAsync({
        images: customImages,
        type: 'SYSTEM' as const,
        isDefault: false,
        price: Number(customPrice),
        designRequestId,
        orderId
      })

      toast.success('🎉 Đã gửi preset xinh đẹp cho mẹ bầu thành công!')

      // Reset form
      setCustomImages([])
      setCustomPrice('')
      setSelectedImageIndex(null)
      onClose()
    } catch (error) {
      console.error('Error sending custom preset:', error)
      toast.error('Có lỗi khi gửi preset, vui lòng thử lại')
    }
  }

  const formatCurrency = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return ''
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(amount))
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-[28rem] bg-background border-l shadow-2xl transform transition-transform duration-500 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <Card className='h-full rounded-none border-0 shadow-none bg-gradient-to-b from-violet-50/30 to-white'>
          {/* Header */}
          <CardHeader className='border-b bg-gradient-to-r from-violet-500 to-purple-600 text-white relative overflow-hidden'>
            <div className='absolute inset-0 bg-white/10 backdrop-blur-sm'></div>
            <div className='relative z-10'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                    <Sparkles className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-xl font-bold'>Tạo Preset Xinh Đẹp</CardTitle>
                    <p className='text-violet-100 text-sm'>Thiết kế đặc biệt cho mẹ bầu</p>
                  </div>
                </div>
                <Button variant='ghost' size='sm' onClick={onClose} className='text-white hover:bg-white/20'>
                  <X className='h-4 w-4' />
                </Button>
              </div>

              {/* Customer Info */}
              <div className='flex items-center gap-3 p-3 bg-white/10 rounded-lg'>
                <Avatar className='h-8 w-8 ring-2 ring-white/30'>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customerName}`} />
                  <AvatarFallback className='bg-white/20 text-white text-sm'>
                    <User className='h-4 w-4' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className='font-medium text-white'>Gửi đến: {customerName || 'Khách hàng'}</p>
                  <p className='text-xs text-violet-100'>Preset tùy chỉnh đặc biệt</p>
                </div>
                <Heart className='h-4 w-4 text-pink-200' />
              </div>
            </div>
          </CardHeader>

          <ScrollArea className='flex-1'>
            <CardContent className='p-6 space-y-8'>
              {/* Images Upload Section */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <Camera className='h-5 w-5 text-violet-500' />
                  <Label className='text-base font-semibold text-violet-700'>Hình ảnh thiết kế</Label>
                  <Badge variant='destructive' className='text-xs'>
                    Bắt buộc
                  </Badge>
                </div>

                {/* Image Grid */}
                <div className='grid grid-cols-2 gap-4'>
                  {customImages.map((image, index) => (
                    <div
                      key={index}
                      className='relative aspect-square bg-violet-50 rounded-xl overflow-hidden group cursor-pointer border-2 border-violet-200 hover:border-violet-400 transition-all duration-200'
                      onClick={() => setSelectedImageIndex(selectedImageIndex === index ? null : index)}
                    >
                      <img src={image} alt={`Design ${index + 1}`} className='w-full h-full object-cover' />

                      {/* Selection Overlay */}
                      {selectedImageIndex === index && (
                        <div className='absolute inset-0 bg-violet-500/20 flex items-center justify-center'>
                          <div className='w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center'>
                            <Eye className='h-4 w-4 text-white' />
                          </div>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='secondary'
                            className='h-8 w-8 p-0 bg-white/90 hover:bg-white'
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(image, '_blank')
                            }}
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            className='h-8 w-8 p-0'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage(index)
                            }}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      {/* Image Index */}
                      <div className='absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full'>
                        {index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Add Image Button */}
                  <div className='aspect-square border-2 border-dashed border-violet-300 rounded-xl flex items-center justify-center hover:border-violet-500 hover:bg-violet-50 transition-all duration-200 relative group'>
                    <div className='absolute inset-0'>
                      <CloudinarySingleImageUpload
                        value=''
                        onChange={handleAddImage}
                        placeholder='Thêm hình ảnh thiết kế'
                        className='w-full h-full opacity-0'
                      />
                    </div>
                    <div className='flex flex-col items-center gap-3 text-violet-500 group-hover:text-violet-600 transition-colors pointer-events-none'>
                      <div className='w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform'>
                        <Plus className='h-6 w-6' />
                      </div>
                      <div className='text-center'>
                        <p className='text-sm font-medium'>Thêm hình ảnh</p>
                        <p className='text-xs text-violet-400'>Tối đa 10 hình</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Count */}
                {customImages.length > 0 && (
                  <div className='flex items-center gap-2 text-sm text-violet-600 bg-violet-50 px-3 py-2 rounded-lg'>
                    <Camera className='h-4 w-4' />
                    <span>
                      Đã thêm <strong>{customImages.length}</strong> hình ảnh thiết kế
                    </span>
                    <Sparkles className='h-4 w-4 text-violet-400' />
                  </div>
                )}
              </div>

              <Separator className='bg-violet-100' />

              {/* Price Section */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-5 w-5 text-emerald-500' />
                  <Label htmlFor='custom-price' className='text-base font-semibold text-emerald-700'>
                    Giá preset
                  </Label>
                  <Badge variant='destructive' className='text-xs'>
                    Bắt buộc
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='relative'>
                    <Input
                      id='custom-price'
                      type='number'
                      placeholder='Nhập giá preset (VNĐ)...'
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className='text-right text-lg font-semibold pl-12 pr-4 h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                    />
                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500'>
                      <DollarSign className='h-5 w-5' />
                    </div>
                  </div>

                  {customPrice && !isNaN(Number(customPrice)) && Number(customPrice) > 0 && (
                    <div className='p-4 bg-emerald-50 border border-emerald-200 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-emerald-700 font-medium'>Giá hiển thị:</span>
                        <span className='text-xl font-bold text-emerald-800'>{formatCurrency(customPrice)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator className='bg-violet-100' />

              {/* Preview Section */}
              {(customImages.length > 0 || customPrice) && (
                <div className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Gift className='h-5 w-5 text-pink-500' />
                    <Label className='text-base font-semibold text-pink-700'>Xem trước preset</Label>
                  </div>

                  <Card className='p-6 bg-gradient-to-br from-pink-50 to-violet-50 border-2 border-pink-200'>
                    <div className='space-y-4'>
                      {/* Preview Images */}
                      {customImages.length > 0 && (
                        <div className='space-y-3'>
                          <h4 className='text-sm font-semibold text-pink-700 flex items-center gap-2'>
                            <Camera className='h-4 w-4' />
                            Hình ảnh preset ({customImages.length})
                          </h4>
                          <div className='flex gap-2 overflow-x-auto pb-2'>
                            {customImages.map((image, index) => (
                              <div
                                key={index}
                                className='flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white border-2 border-pink-200 shadow-sm'
                              >
                                <img src={image} alt={`Preview ${index + 1}`} className='w-full h-full object-cover' />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preview Price */}
                      {customPrice && !isNaN(Number(customPrice)) && Number(customPrice) > 0 && (
                        <div className='flex items-center justify-between p-4 bg-white/60 rounded-lg border border-pink-200'>
                          <span className='text-sm font-semibold text-pink-700 flex items-center gap-2'>
                            <DollarSign className='h-4 w-4' />
                            Giá preset:
                          </span>
                          <span className='text-lg font-bold text-pink-800'>{formatCurrency(customPrice)}</span>
                        </div>
                      )}

                      {/* Preview Message */}
                      <div className='p-3 bg-white/60 rounded-lg border border-pink-200'>
                        <p className='text-xs text-pink-600 text-center italic'>
                          💝 Preset đặc biệt được thiết kế riêng cho bạn với tình yêu thương
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </ScrollArea>

          {/* Footer */}
          <div className='border-t bg-gradient-to-r from-violet-50 to-purple-50 p-6'>
            {/* Validation Messages */}
            {(customImages.length === 0 || !customPrice || Number(customPrice) <= 0) && (
              <div className='mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                <p className='text-sm text-orange-700 text-center flex items-center justify-center gap-2'>
                  <AlertTriangle className='h-4 w-4' />
                  {customImages.length === 0 && (!customPrice || Number(customPrice) <= 0)
                    ? 'Vui lòng thêm hình ảnh và nhập giá hợp lệ'
                    : customImages.length === 0
                      ? 'Vui lòng thêm ít nhất một hình ảnh thiết kế'
                      : 'Vui lòng nhập giá preset hợp lệ'}
                </p>
              </div>
            )}

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={onClose}
                className='flex-1 border-violet-200 text-violet-600 hover:bg-violet-50'
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSendCustomPreset}
                disabled={
                  customImages.length === 0 || !customPrice || Number(customPrice) <= 0 || sendPresetMutation.isPending
                }
                className='flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50'
              >
                {sendPresetMutation.isPending ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    Đang gửi...
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <Send className='h-4 w-4' />
                    Gửi Preset
                    <Heart className='h-4 w-4' />
                  </div>
                )}
              </Button>
            </div>

            {/* Success Indicator */}
            {customImages.length > 0 && customPrice && Number(customPrice) > 0 && (
              <div className='mt-3 flex items-center justify-center gap-2 text-green-600'>
                <Check className='h-4 w-4' />
                <span className='text-sm font-medium'>Sẵn sàng gửi preset xinh đẹp! ✨</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

// Add missing import
import { AlertTriangle } from 'lucide-react'
