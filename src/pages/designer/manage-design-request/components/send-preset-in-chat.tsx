import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePresets, useSendPresetToDesignRequest } from '@/hooks/use-preset'
import { toast } from 'sonner'
import { CloudinaryImageUpload } from '@/components/cloudinary-image-upload'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoaderCircle, Package, Plus, Send } from 'lucide-react'
import PriceInput from '@/components/ui/price-input'

export interface SendPresetInChatProps {
  isOpen: boolean
  onClose: () => void
  designRequestId: string
  orderCode: string
  roomId: string | null
  orderId?: string
}

export function SendPresetInChat({
  isOpen,
  onClose,
  designRequestId,
  orderCode,
  roomId,
  orderId
}: SendPresetInChatProps) {
  const [activeTab, setActiveTab] = useState('existing')
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom preset states
  const [customPreset, setCustomPreset] = useState({
    name: '',
    price: 0,
    description: '',
    imageUrls: [] as string[],
  })

  const { data: presetsData, isLoading: isLoadingPresets } = usePresets({
    index: 1,
    pageSize: 20
  })

  const sendPresetMutation = useSendPresetToDesignRequest()

  // Function để reset form
  const resetForm = () => {
    setCustomPreset({
      name: '',
      price: 0,
      description: '',
      imageUrls: [],
    })
    setSelectedPresetId(null)
    setActiveTab('existing')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSendExistingPreset = async () => {
    if (!selectedPresetId || !roomId) {
      toast.error('Vui lòng chọn preset và đảm bảo đang trong phòng chat')
      return
    }

    setIsSubmitting(true)
    try {
      // Find selected preset to get its images
      const selectedPreset = presets.find((p) => p.id === selectedPresetId)
      if (!selectedPreset) {
        toast.error('Không tìm thấy preset được chọn')
        return
      }

      await sendPresetMutation.mutateAsync({
        name: selectedPreset.name,
        images: selectedPreset.images || [],
        type: 'SYSTEM' as const,
        isDefault: false,
        price: selectedPreset.price || 0,
        designRequestId,
        orderId: orderId || ''
      })

      // Reset form sau khi gửi thành công
      resetForm()
      
      onClose()
    } catch (error) {
      console.error('Error sending preset:', error)
      toast.error('Đã quá lượt version, bạn vui lòng nói chuyện với khách hàng về điều này')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendCustomPreset = async () => {
    if (
      !customPreset.name.trim() ||
      !customPreset.price ||
      Number(customPreset.price) <= 0 ||
      customPreset.imageUrls.length === 0 ||
      !roomId
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin preset (tên, giá hợp lệ và hình ảnh)')
      return
    }

    setIsSubmitting(true)
    try {
      await sendPresetMutation.mutateAsync({
        name: customPreset.name,
        images: customPreset.imageUrls,
        type: 'SYSTEM' as const,
        isDefault: false,
        price: Number(customPreset.price),
        designRequestId,
        orderId: orderId || ''
      })
      
      // Reset form sau khi gửi thành công
      resetForm()
      
      onClose()
    } catch (error) {
      console.error('Error sending custom preset:', error)
      toast.error('Gửi preset thất bại. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const presets = presetsData?.data?.items || []

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Gửi thiết kế cho Đơn Hàng #{orderCode}
          </DialogTitle>
          <DialogDescription>Chọn thiết kế có sẵn hoặc tạo thiết kế mới tùy chỉnh để gửi cho khách hàng</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='existing'>Preset Có Sẵn</TabsTrigger>
            <TabsTrigger value='custom'>Tạo Preset Tùy Chỉnh</TabsTrigger>
          </TabsList>

          <TabsContent value='existing' className='space-y-4'>
            {isLoadingPresets ? (
              <div className='flex items-center justify-center py-8'>
                <LoaderCircle className='h-6 w-6 animate-spin' />
                <span className='ml-2'>Đang tải preset...</span>
              </div>
            ) : presets.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                Không có preset nào. Hãy tạo preset tùy chỉnh.
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto'>
                {presets.map((preset) => (
                  <Card
                    key={preset.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPresetId === preset.id ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => setSelectedPresetId(preset.id)}
                  >
                    <CardContent className='p-4'>
                      {preset.images?.[0] && (
                        <img
                          src={preset.images[0]}
                          alt={preset.styleName}
                          className='w-full h-32 object-cover rounded-md mb-3'
                        />
                      )}
                      <div className='space-y-2'>
                        <h3 className='font-medium text-sm line-clamp-1'>{preset.styleName}</h3>
                        <p className='text-xs text-muted-foreground'>Giá: {preset.price.toLocaleString()}đ</p>
                        <Badge variant='secondary' className='text-xs'>
                          {preset.type}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className='flex justify-end gap-2 pt-4'>
              <Button variant='outline' onClick={handleClose}>
                Hủy
              </Button>
              <Button onClick={handleSendExistingPreset} disabled={!selectedPresetId || isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircle className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Send className='h-4 w-4 mr-2' />
                )}
                Gửi Preset
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='custom' className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='preset-name'>Tên Preset</Label>
                <Input
                  id='preset-name'
                  placeholder='Nhập tên preset...'
                  value={customPreset.name}
                  onChange={(e) => setCustomPreset((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='preset-price'>Giá Preset (VNĐ)</Label>
                <PriceInput
                  id='preset-price'
                  min='0'
                  placeholder='Nhập giá preset...'
                  value={customPreset.price}
                  onChange={(e) => setCustomPreset((prev) => ({ ...prev, price: e }))}
                />
                <p className='text-xs text-muted-foreground'>Giá preset sẽ được hiển thị cho khách hàng</p>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='preset-description'>Mô Tả</Label>
                <Textarea
                  id='preset-description'
                  placeholder='Nhập mô tả preset...'
                  value={customPreset.description}
                  onChange={(e) => setCustomPreset((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className='grid gap-2'>
                <Label>Hình Ảnh Preset</Label>
                <CloudinaryImageUpload
                  value={customPreset.imageUrls}
                  onChange={(urls) => {
                    setCustomPreset((prev) => ({
                      ...prev,
                      imageUrls: urls
                    }))
                  }}
                  maxFiles={5}
                />
              </div>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button variant='outline' onClick={handleClose}>
                Hủy
              </Button>
              <Button
                onClick={handleSendCustomPreset}
                disabled={
                  !customPreset.name.trim() ||
                  !customPreset.price ||
                  Number(customPreset.price) <= 0 ||
                  customPreset.imageUrls.length === 0 ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <LoaderCircle className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Plus className='h-4 w-4 mr-2' />
                )}
                Tạo & Gửi Preset
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
