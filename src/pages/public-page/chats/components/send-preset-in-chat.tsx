import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Palette, Plus, Send } from 'lucide-react'
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

  // Hooks
  const sendPresetMutation = useSendPresetToCustomer()

  const handleSendCustomPreset = async () => {
    if (customImages.length === 0) {
      toast.error('Vui lòng thêm ít nhất một hình ảnh')
      return
    }

    if (!customPrice || isNaN(Number(customPrice))) {
      toast.error('Vui lòng nhập giá hợp lệ')
      return
    }

    try {
      await sendPresetMutation.mutateAsync({
        images: customImages,
        type: 'USER' as const,
        isDefault: false,
        price: Number(customPrice),
        designRequestId,
        orderId
      })
      toast.success('Đã tạo và gửi preset tùy chỉnh thành công!')

      // Reset form
      setCustomImages([])
      setCustomPrice('')
      onClose()
    } catch (error) {
      console.error('Error sending custom preset:', error)
      toast.error('Có lỗi khi gửi preset tùy chỉnh')
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 z-50 w-96 bg-background border-l shadow-lg transform transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <Card className='h-full rounded-none border-0 shadow-none'>
        <CardHeader className='border-b bg-muted/30'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Palette className='h-5 w-5' />
              Tạo Preset Mới
            </CardTitle>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
          <p className='text-sm text-muted-foreground'>Tạo preset tùy chỉnh cho {customerName || 'khách hàng'}</p>
        </CardHeader>

        <ScrollArea className='flex-1'>
          <CardContent className='p-6 space-y-6'>
            {/* Images Upload Section */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Hình ảnh preset *</Label>
              <div className='grid grid-cols-2 gap-3'>
                {customImages.map((image, index) => (
                  <div key={index} className='relative aspect-square bg-muted rounded-lg overflow-hidden group'>
                    <img src={image} alt={`Custom ${index + 1}`} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <Button
                        size='sm'
                        variant='destructive'
                        className='h-8 w-8 p-0'
                        onClick={() => setCustomImages((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Add Image Button */}
                <div className='aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors relative'>
                  <div className='absolute inset-0'>
                    <CloudinarySingleImageUpload
                      value=''
                      onChange={(url: string) => {
                        if (url && !customImages.includes(url)) {
                          setCustomImages((prev) => [...prev, url])
                        }
                      }}
                      placeholder='Thêm hình ảnh'
                      className='w-full h-full'
                    />
                  </div>
                  <div className='flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer p-4 pointer-events-none'>
                    <div className='h-8 w-8 rounded-full border-2 border-dashed border-current flex items-center justify-center'>
                      <Plus className='h-4 w-4' />
                    </div>
                    <span className='text-xs font-medium'>Thêm hình ảnh</span>
                  </div>
                </div>
              </div>

              {customImages.length > 0 && (
                <p className='text-xs text-muted-foreground'>Đã thêm {customImages.length} hình ảnh</p>
              )}
            </div>

            {/* Price Section */}
            <div className='space-y-3'>
              <Label htmlFor='custom-price' className='text-sm font-medium'>
                Giá preset (VNĐ) *
              </Label>
              <Input
                id='custom-price'
                type='number'
                placeholder='Nhập giá preset...'
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className='text-right'
              />
              {customPrice && !isNaN(Number(customPrice)) && (
                <p className='text-xs text-muted-foreground'>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(Number(customPrice))}
                </p>
              )}
            </div>

            {/* Preview Section */}
            {(customImages.length > 0 || customPrice) && (
              <div className='space-y-3'>
                <Label className='text-sm font-medium'>Xem trước preset</Label>
                <Card className='p-4 bg-muted/30'>
                  <div className='space-y-3'>
                    {customImages.length > 0 && (
                      <div className='flex gap-2 overflow-x-auto'>
                        {customImages.slice(0, 3).map((image, index) => (
                          <div key={index} className='flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted'>
                            <img src={image} alt={`Preview ${index + 1}`} className='w-full h-full object-cover' />
                          </div>
                        ))}
                        {customImages.length > 3 && (
                          <div className='flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center'>
                            <span className='text-xs text-muted-foreground'>+{customImages.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {customPrice && (
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>Giá:</span>
                        <span className='font-medium'>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(Number(customPrice))}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </CardContent>
        </ScrollArea>

        {/* Footer with Send Button */}
        <div className='border-t p-4 bg-muted/30'>
          <div className='flex gap-3'>
            <Button variant='outline' onClick={onClose} className='flex-1'>
              Hủy
            </Button>
            <Button
              onClick={handleSendCustomPreset}
              disabled={customImages.length === 0 || !customPrice || sendPresetMutation.isPending}
              className='flex-1'
            >
              <Send className='h-4 w-4 mr-2' />
              {sendPresetMutation.isPending ? 'Đang gửi...' : 'Gửi Preset'}
            </Button>
          </div>

          {(customImages.length === 0 || !customPrice) && (
            <p className='text-xs text-muted-foreground mt-2 text-center'>
              {customImages.length === 0 && !customPrice
                ? 'Vui lòng thêm hình ảnh và nhập giá'
                : customImages.length === 0
                  ? 'Vui lòng thêm ít nhất một hình ảnh'
                  : 'Vui lòng nhập giá preset'}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
