import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/utils'
import { useCloudinaryUpload, UploadOptions } from '@/services/upload/cloudinary.service'

interface CloudinaryImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  className?: string
  placeholder?: string
  accept?: string
  uploadOptions?: UploadOptions
  disabled?: boolean
}

interface UploadedImage {
  id: string
  url: string
  publicId?: string
  file?: File
  isUploading?: boolean
}

export function CloudinaryImageUpload({
  value = [],
  onChange,
  maxFiles = 5,
  className,
  placeholder = 'Upload images or enter URL',
  accept = 'image/*',
  uploadOptions = {},
  disabled = false
}: CloudinaryImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(value.map((url, index) => ({ id: `existing-${index}`, url })))
  const [urlInput, setUrlInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadMultiple, isConfigured } = useCloudinaryUpload()

  const updateParent = useCallback(
    (newImages: UploadedImage[]) => {
      const urls = newImages.filter((img) => !img.isUploading).map((img) => img.url)
      onChange(urls)
    },
    [onChange]
  )

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return

    // Kiểm tra Cloudinary có được cấu hình không
    if (!isConfigured) {
      alert('Cloudinary chưa được cấu hình. Vui lòng kiểm tra environment variables.')
      return
    }

    const fileArray = Array.from(files)
    const remainingSlots = maxFiles - images.length
    const filesToProcess = fileArray.slice(0, remainingSlots)

    // Add files với trạng thái uploading
    const newImages: UploadedImage[] = filesToProcess.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      url: URL.createObjectURL(file), // Preview URL
      file,
      isUploading: true
    }))

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)

    try {
      // Upload files lên Cloudinary
      const uploadResults = await uploadMultiple(filesToProcess, uploadOptions)

      // Cập nhật images với URLs từ Cloudinary
      setImages((prev) =>
        prev.map((img) => {
          if (img.isUploading && img.file) {
            const fileIndex = filesToProcess.findIndex((f) => f === img.file)
            if (fileIndex !== -1 && uploadResults[fileIndex]) {
              return {
                ...img,
                url: uploadResults[fileIndex].secure_url,
                publicId: uploadResults[fileIndex].public_id,
                isUploading: false
              }
            }
          }
          return img
        })
      )
    } catch (error) {
      console.error('Upload failed:', error)
      // Xóa các files upload thất bại
      setImages((prev) => prev.filter((img) => !img.isUploading))
    }
  }

  const handleUrlAdd = () => {
    if (urlInput.trim() && images.length < maxFiles && !disabled) {
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
    if (disabled) return

    const updatedImages = images.filter((img) => img.id !== id)
    setImages(updatedImages)
    updateParent(updatedImages)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  // Update parent khi images thay đổi (trừ những cái đang uploading)
  // Lưu ý: không đưa updateParent vào deps để tránh loop khi parent truyền onChange mới mỗi render
  useEffect(() => {
    const urls = images.filter((img) => !img.isUploading).map((img) => img.url)
    onChange(urls)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  const canUpload = images.length < maxFiles && !disabled && isConfigured

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cảnh báo nếu Cloudinary chưa được cấu hình */}
      {!isConfigured && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800'>
            ⚠️ Cloudinary chưa được cấu hình. Vui lòng thêm các environment variables:
          </p>
          <ul className='text-xs text-yellow-700 mt-1 ml-4 list-disc'>
            <li>VITE_CLOUDINARY_CLOUD_NAME</li>
            <li>VITE_CLOUDINARY_UPLOAD_PRESET</li>
          </ul>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          !canUpload ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => canUpload && fileInputRef.current?.click()}
      >
        <Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' aria-hidden='true' />
        <p className='text-sm text-gray-600 mb-2'>
          {!canUpload
            ? disabled
              ? 'Upload đã bị vô hiệu hóa'
              : !isConfigured
                ? 'Cloudinary chưa được cấu hình'
                : `Đã đạt tối đa ${maxFiles} ảnh`
            : 'Kéo thả ảnh vào đây, hoặc nhấp để chọn'}
        </p>
        <p className='text-xs text-gray-500'>Hỗ trợ JPG, PNG, WebP tối đa 10MB</p>

        <input
          ref={fileInputRef}
          type='file'
          accept={accept}
          multiple
          className='hidden'
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={!canUpload}
        />
      </div>

      {/* URL Input */}
      {canUpload && (
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
            disabled={disabled}
          />
          <Button type='button' variant='outline' onClick={handleUrlAdd} disabled={!urlInput.trim() || disabled}>
            Thêm URL
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
                    <Loader2 className='h-8 w-8 animate-spin text-gray-400' aria-hidden='true' />
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
                    disabled={disabled}
                    aria-label='Xóa ảnh'
                  >
                    <X className='h-3 w-3' aria-hidden='true' />
                  </Button>
                )}

                {/* Upload Status */}
                {image.isUploading && (
                  <div className='absolute bottom-2 left-2'>
                    <Badge variant='secondary' className='text-xs'>
                      Đang upload...
                    </Badge>
                  </div>
                )}

                {/* Cloudinary Badge */}
                {image.publicId && !image.isUploading && (
                  <div className='absolute bottom-2 right-2'>
                    <Badge variant='outline' className='text-xs bg-white/80'>
                      Cloudinary
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
          {images.filter((img) => !img.isUploading).length} / {maxFiles} ảnh
        </p>
      )}
    </div>
  )
}
