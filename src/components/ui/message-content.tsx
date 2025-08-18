import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageViewer } from '@/components/ui/image-viewer'
import { MessageType } from '@/@types/chat.types'
import { cn } from '@/lib/utils/utils'
import { Download, FileText, FileImage, File, Palette, Sparkles, Eye, Package, ExternalLink } from 'lucide-react'

interface MessageContentProps {
  message: string
  type?: MessageType | number
  isCurrentUser?: boolean
  className?: string
}

// Component hiển thị tin nhắn hình ảnh
function ImageMessage({ message, isCurrentUser }: { message: string; isCurrentUser?: boolean }) {
  try {
    // Parse JSON để lấy danh sách hình ảnh
    const images = JSON.parse(message)

    if (Array.isArray(images) && images.length > 0) {
      return (
        <div className='space-y-2'>
          <div className='grid grid-cols-2 gap-2 max-w-xs'>
            {images.slice(0, 4).map((imageUrl: string, index: number) => (
              <ImageViewer
                key={index}
                src={imageUrl}
                alt={`Hình ảnh ${index + 1}`}
                containerClassName='w-full'
                thumbnailClassName='w-full h-24 object-cover rounded'
                title={`Hình ảnh ${index + 1}`}
              />
            ))}
          </div>
          {images.length > 4 && (
            <p className={cn('text-xs', isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              +{images.length - 4} hình ảnh khác
            </p>
          )}
        </div>
      )
    }
  } catch {
    // Nếu không parse được JSON, coi như là URL đơn lẻ
    if (message.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return (
        <ImageViewer
          src={message}
          alt='Hình ảnh'
          className='max-w-xs'
          thumbnailClassName='w-full h-32 object-cover rounded'
          title='Hình ảnh'
        />
      )
    }
  }

  // Fallback về text nếu không phải hình ảnh hợp lệ
  return <span>{message}</span>
}

// Component hiển thị file đính kèm
function FileMessage({ message, isCurrentUser }: { message: string; isCurrentUser?: boolean }) {
  try {
    const fileData = JSON.parse(message)

    if (fileData.url && fileData.name) {
      const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()

        switch (ext) {
          case 'pdf':
            return <FileText className='h-5 w-5 text-red-500' />
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'webp':
            return <FileImage className='h-5 w-5 text-blue-500' />
          default:
            return <File className='h-5 w-5 text-gray-500' />
        }
      }

      return (
        <Card className={cn('p-3 max-w-xs', isCurrentUser ? 'bg-primary-foreground/10' : 'bg-muted/50')}>
          <CardContent className='p-0'>
            <div className='flex items-center gap-3'>
              {getFileIcon(fileData.name)}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{fileData.name}</p>
                {fileData.size && (
                  <p className={cn('text-xs', isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                    {(fileData.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <div className='flex gap-1'>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 w-8 p-0'
                  onClick={() => window.open(fileData.url, '_blank')}
                >
                  <Eye className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-8 w-8 p-0'
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = fileData.url
                    a.download = fileData.name
                    a.click()
                  }}
                >
                  <Download className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  } catch {
    // Fallback về link đơn giản
    if (message.startsWith('http')) {
      return (
        <Button
          variant='link'
          className='p-0 h-auto text-left justify-start'
          onClick={() => window.open(message, '_blank')}
        >
          <ExternalLink className='h-4 w-4 mr-2' />
          Tải xuống file
        </Button>
      )
    }
  }

  return <span>{message}</span>
}

// Component hiển thị yêu cầu thiết kế
function DesignRequestMessage({ message, isCurrentUser }: { message: string; isCurrentUser?: boolean }) {
  try {
    const designData = JSON.parse(message)

    return (
      <Card
        className={cn(
          'p-4 max-w-sm border-l-4 border-l-violet-500',
          isCurrentUser ? 'bg-primary-foreground/10' : 'bg-violet-50'
        )}
      >
        <CardContent className='p-0 space-y-3'>
          <div className='flex items-center gap-2'>
            <Palette className='h-5 w-5 text-violet-600' />
            <span className='font-semibold text-violet-800'>Yêu cầu thiết kế</span>
          </div>

          {designData.title && <p className='font-medium text-sm'>{designData.title}</p>}

          {designData.description && <p className='text-sm text-gray-700'>{designData.description}</p>}

          {designData.requirements && Array.isArray(designData.requirements) && (
            <div className='space-y-1'>
              <p className='text-xs font-medium text-gray-600'>Yêu cầu:</p>
              <ul className='text-xs text-gray-600 space-y-1'>
                {designData.requirements.map((req: string, index: number) => (
                  <li key={index} className='flex items-start gap-1'>
                    <span className='text-violet-500'>•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {designData.orderCode && (
            <div className='flex items-center gap-2 pt-2 border-t'>
              <Package className='h-4 w-4 text-gray-500' />
              <span className='text-xs text-gray-600'>Đơn hàng: #{designData.orderCode}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch {
    return (
      <Card
        className={cn(
          'p-3 border-l-4 border-l-violet-500',
          isCurrentUser ? 'bg-primary-foreground/10' : 'bg-violet-50'
        )}
      >
        <CardContent className='p-0'>
          <div className='flex items-center gap-2 mb-2'>
            <Palette className='h-4 w-4 text-violet-600' />
            <span className='text-sm font-medium text-violet-800'>Yêu cầu thiết kế</span>
          </div>
          <p className='text-sm'>{message}</p>
        </CardContent>
      </Card>
    )
  }
}

// Component hiển thị preset
function PresetMessage({ message, isCurrentUser }: { message: string; isCurrentUser?: boolean }) {
  try {
    const presetData = JSON.parse(message)

    return (
      <Card
        className={cn(
          'p-4 max-w-sm border-l-4 border-l-pink-500',
          isCurrentUser ? 'bg-primary-foreground/10' : 'bg-pink-50'
        )}
      >
        <CardContent className='p-0 space-y-3'>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-pink-600' />
            <span className='font-semibold text-pink-800'>Preset thiết kế</span>
            <Badge variant='secondary' className='text-xs'>
              {presetData.isDefault ? 'Mặc định' : 'Tùy chỉnh'}
            </Badge>
          </div>

          {presetData.styleName && <p className='font-medium text-sm'>{presetData.styleName}</p>}

          {presetData.images && Array.isArray(presetData.images) && presetData.images.length > 0 && (
            <div className='space-y-2'>
              <div className='grid grid-cols-2 gap-2'>
                {presetData.images.slice(0, 4).map((imageUrl: string, index: number) => (
                  <ImageViewer
                    key={index}
                    src={imageUrl}
                    alt={`Preset ${index + 1}`}
                    className='w-full'
                    thumbnailClassName='w-full h-20 object-cover rounded'
                    title={`Preset ${index + 1}`}
                  />
                ))}
              </div>
              {presetData.images.length > 4 && (
                <p className='text-xs text-gray-600'>+{presetData.images.length - 4} hình ảnh khác</p>
              )}
            </div>
          )}

          {presetData.price && (
            <div className='flex items-center justify-between pt-2 border-t'>
              <span className='text-sm font-medium text-pink-700'>Giá:</span>
              <span className='text-sm font-bold text-pink-800'>
                {Number(presetData.price).toLocaleString('vi-VN')}₫
              </span>
            </div>
          )}

          {presetData.description && <p className='text-xs text-gray-600'>{presetData.description}</p>}
        </CardContent>
      </Card>
    )
  } catch {
    return (
      <Card
        className={cn('p-3 border-l-4 border-l-pink-500', isCurrentUser ? 'bg-primary-foreground/10' : 'bg-pink-50')}
      >
        <CardContent className='p-0'>
          <div className='flex items-center gap-2 mb-2'>
            <Sparkles className='h-4 w-4 text-pink-600' />
            <span className='text-sm font-medium text-pink-800'>Preset thiết kế</span>
          </div>
          <p className='text-sm'>{message}</p>
        </CardContent>
      </Card>
    )
  }
}

// Component chính
export function MessageContent({ message, type, isCurrentUser, className }: MessageContentProps) {
  const messageType = typeof type === 'number' ? type : Number(type)

  const content = (() => {
    switch (messageType) {
      case MessageType.Image:
        return <ImageMessage message={message} isCurrentUser={isCurrentUser} />

      case MessageType.File:
        return <FileMessage message={message} isCurrentUser={isCurrentUser} />

      case MessageType.Design_Request:
        return <DesignRequestMessage message={message} isCurrentUser={isCurrentUser} />

      case MessageType.Preset:
        return <PresetMessage message={message} isCurrentUser={isCurrentUser} />

      case MessageType.Text:
      default:
        return <span className='text-sm whitespace-pre-wrap break-words'>{message}</span>
    }
  })()

  return <div className={cn('w-full', className)}>{content}</div>
}

export default MessageContent
