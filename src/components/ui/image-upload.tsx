import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/utils'

interface ImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  className?: string
  placeholder?: string
  accept?: string
}

interface UploadedImage {
  id: string
  url: string
  file?: File
  isUploading?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  className,
  placeholder = 'Upload images or enter URL',
  accept = 'image/*'
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(value.map((url, index) => ({ id: `existing-${index}`, url })))
  const [urlInput, setUrlInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simulate upload function - replace with actual upload logic
  const simulateUpload = async (file: File): Promise<string> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For demo, create a blob URL - in production, upload to your server/CDN
    return URL.createObjectURL(file)
  }

  const updateParent = useCallback(
    (newImages: UploadedImage[]) => {
      const urls = newImages.filter((img) => !img.isUploading).map((img) => img.url)
      onChange(urls)
    },
    [onChange]
  )

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const remainingSlots = maxFiles - images.length
    const filesToProcess = fileArray.slice(0, remainingSlots)

    // Add files with uploading state
    const newImages: UploadedImage[] = filesToProcess.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      url: URL.createObjectURL(file), // Preview URL
      file,
      isUploading: true
    }))

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)

    // Upload files one by one
    for (const newImage of newImages) {
      try {
        if (newImage.file) {
          const uploadedUrl = await simulateUpload(newImage.file)

          setImages((prev) =>
            prev.map((img) => (img.id === newImage.id ? { ...img, url: uploadedUrl, isUploading: false } : img))
          )
        }
      } catch (error) {
        console.error('Upload failed:', error)
        // Remove failed upload
        setImages((prev) => prev.filter((img) => img.id !== newImage.id))
      }
    }
  }

  const handleUrlAdd = () => {
    if (urlInput.trim() && images.length < maxFiles) {
      const newImage: UploadedImage = {
        id: `url-${Date.now()}`,
        url: urlInput.trim()
      }
      const updatedImages = [...images, newImage]
      setImages(updatedImages)
      updateParent(updatedImages)
      setUrlInput('')
    }
  }

  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id)
    setImages(updatedImages)
    updateParent(updatedImages)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  // Update parent when images change (excluding uploading ones)
  useEffect(() => {
    updateParent(images)
  }, [images, updateParent])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          images.length >= maxFiles ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
        <p className='text-sm text-gray-600 mb-2'>
          {images.length >= maxFiles
            ? `Maximum ${maxFiles} images reached`
            : 'Drag and drop images here, or click to select'}
        </p>
        <p className='text-xs text-gray-500'>Supports JPG, PNG, WebP up to 10MB</p>

        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          multiple
          className='hidden'
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={images.length >= maxFiles}
        />
      </div>

      {/* URL Input */}
      {images.length < maxFiles && (
        <div className='flex gap-2'>
          <Input
            placeholder={placeholder}
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleUrlAdd()
              }
            }}
          />
          <Button type='button' variant='outline' onClick={handleUrlAdd} disabled={!urlInput.trim()}>
            Add URL
          </Button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {images.map((image) => (
            <div key={image.id} className='relative group'>
              <div className='aspect-square rounded-lg overflow-hidden border bg-gray-100'>
                {image.isUploading ? (
                  <div className='w-full h-full flex items-center justify-center'>
                    <Loader2 className='h-8 w-8 animate-spin text-gray-400' />
                  </div>
                ) : (
                  <img
                    src={image.url}
                    alt='Upload preview'
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      // Handle broken images
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML =
                          '<div class="w-full h-full flex items-center justify-center"><svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>'
                      }
                    }}
                  />
                )}

                {/* Remove Button */}
                {!image.isUploading && (
                  <Button
                    type='button'
                    variant='destructive'
                    size='sm'
                    className='absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(image.id)
                    }}
                  >
                    <X className='h-3 w-3' />
                  </Button>
                )}

                {/* Upload Status */}
                {image.isUploading && (
                  <div className='absolute bottom-2 left-2'>
                    <Badge variant='secondary' className='text-xs'>
                      Uploading...
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      {images.length > 0 && (
        <p className='text-sm text-gray-500 text-center'>
          {images.filter((img) => !img.isUploading).length} of {maxFiles} images added
        </p>
      )}
    </div>
  )
}
