import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface ImageViewerProps {
  src: string
  alt: string
  className?: string
  thumbnailClassName?: string
  fallbackIcon?: React.ReactNode
  title?: string
  showZoomIcon?: boolean
}

export function ImageViewer({
  src,
  alt,
  className,
  thumbnailClassName,
  fallbackIcon,
  title,
  showZoomIcon = true
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleImageError = () => {
    setHasError(true)
  }

  const handleThumbnailClick = () => {
    if (!hasError && src) {
      setIsOpen(true)
    }
  }

  // Fallback when image fails to load or no src
  if (!src || hasError) {
    return (
      <div
        className={cn('flex items-center justify-center bg-muted rounded-lg border border-border', thumbnailClassName)}
      >
        {fallbackIcon || (
          <div className='text-muted-foreground'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Thumbnail */}
      <div className={cn('relative group cursor-pointer', className)} onClick={handleThumbnailClick}>
        <img
          src={src}
          alt={alt}
          className={cn(
            'object-cover rounded-lg border border-border transition-all duration-200 group-hover:brightness-75',
            thumbnailClassName
          )}
          onError={handleImageError}
        />

        {/* Zoom icon overlay */}
        {showZoomIcon && (
          <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none'>
            <div className='bg-black/50 rounded-full p-2'>
              <ZoomIn className='w-4 h-4 text-white' />
            </div>
          </div>
        )}
      </div>

      {/* Full-size image dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-4xl max-h-[90vh] p-0'>
          <DialogHeader className='p-6 pb-0'>
            <div className='flex items-center justify-between'>
              <DialogTitle className='text-lg font-semibold'>{title || alt}</DialogTitle>
            </div>
          </DialogHeader>

          <div className='p-6 pt-4'>
            <div className='relative max-h-[70vh] overflow-hidden rounded-lg'>
              <img
                src={src}
                alt={alt}
                className='w-full h-auto object-contain max-h-[70vh]'
                style={{ maxHeight: '70vh' }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Preset variants for common use cases
export function ProductImageViewer({
  src,
  alt,
  className,
  thumbnailClassName
}: {
  src: string
  alt: string
  className?: string
  thumbnailClassName?: string
}) {
  return (
    <ImageViewer
      src={src}
      alt={alt}
      className={className}
      thumbnailClassName={thumbnailClassName || 'w-12 h-12'}
      title='Product Image'
      fallbackIcon={
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
          />
        </svg>
      }
    />
  )
}

export function AvatarImageViewer({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <ImageViewer
      src={src}
      alt={alt}
      className={className}
      thumbnailClassName='w-10 h-10 rounded-full'
      title='Profile Picture'
      fallbackIcon={
        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      }
    />
  )
}
