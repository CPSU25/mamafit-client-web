import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface ImageViewerProps {
  src: string
  alt: string
  containerClassName?: string // class cho KHUNG
  imgClassName?: string // class cho IMG
  fit?: 'contain' | 'cover' // cách fit ảnh trong khung
  title?: string
  showZoomIcon?: boolean
  // Aliases để tương thích ngược với code cũ
  className?: string // alias của imgClassName
  thumbnailClassName?: string // alias của containerClassName
}

export function ImageViewer({
  src,
  alt,
  containerClassName,
  imgClassName,
  fit = 'contain',
  title,
  showZoomIcon = true,
  // aliases
  className,
  thumbnailClassName
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div className={cn('grid place-items-center rounded-lg border border-border/60 bg-muted/40', containerClassName)}>
        <svg className='w-6 h-6 text-muted-foreground' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 5h18M3 19h18M3 5l7.5 7.5M21 5l-7.5 7.5M12 12l6 6M12 12l-6 6'
          />
        </svg>
      </div>
    )
  }

  return (
    <>
      {/* THUMBNAIL */}
      <div
        className={cn(
          'relative group cursor-zoom-in rounded-lg overflow-hidden ring-1 ring-border/70',
          'grid place-items-center', // canh giữa tuyệt đối
          containerClassName,
          thumbnailClassName // alias cho container
        )}
        onClick={() => setIsOpen(true)}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            'block select-none max-w-full max-h-full object-center',
            fit === 'contain' ? '!object-contain !w-auto !h-auto' : '!object-cover !w-full !h-full',
            imgClassName,
            className // alias cho img
          )}
          onError={() => setHasError(true)}
          loading='lazy'
          draggable={false}
        />

        {showZoomIcon && (
          <div className='absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity'>
            <div className='bg-black/50 rounded-full p-2 pointer-events-none'>
              <ZoomIn className='w-4 h-4 text-white' />
            </div>
          </div>
        )}
      </div>

      {/* DIALOG PREVIEW */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-4xl max-h-[90vh] p-0'>
          <DialogHeader className='p-6 pb-0'>
            <DialogTitle className='text-lg font-semibold'>{title || alt}</DialogTitle>
          </DialogHeader>
          <div className='p-6 pt-4'>
            <div className='relative max-h-[70vh] overflow-hidden rounded-lg bg-muted/30 grid place-items-center'>
              <img src={src} alt={alt} className='max-w-full max-h-[70vh] object-contain' draggable={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Preset: ảnh sản phẩm vuông, hiển thị đầy đủ (contain) */
export function ProductImageViewer({
  src,
  alt,
  containerClassName,
  imgClassName,
  fit = 'contain',
  // aliases
  className,
  thumbnailClassName
}: {
  src: string
  alt: string
  containerClassName?: string
  imgClassName?: string
  fit?: 'contain' | 'cover'
  className?: string
  thumbnailClassName?: string
}) {
  return (
    <ImageViewer
      src={src}
      alt={alt}
      fit={fit}
      containerClassName={cn(
        'aspect-square rounded-lg border-2 border-violet-200 dark:border-violet-700 bg-background',
        containerClassName
      )}
      imgClassName={cn('p-1', imgClassName, className)}
      thumbnailClassName={thumbnailClassName}
      title='Product Image'
    />
  )
}

/** Preset: avatar tròn nhỏ */
export function AvatarImageViewer({
  src,
  alt,
  containerClassName,
  imgClassName,
  // aliases
  className,
  thumbnailClassName
}: {
  src: string
  alt: string
  containerClassName?: string
  imgClassName?: string
  className?: string
  thumbnailClassName?: string
}) {
  return (
    <ImageViewer
      src={src}
      alt={alt}
      containerClassName={cn('w-10 h-10 rounded-full ring-1 ring-border/70 bg-background', containerClassName)}
      imgClassName={cn('!w-auto !h-auto', imgClassName, className)}
      thumbnailClassName={thumbnailClassName}
      title='Profile Picture'
      fit='contain'
    />
  )
}
