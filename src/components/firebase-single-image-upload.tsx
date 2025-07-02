import React, { useState, useCallback } from 'react'
import { X, Link, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/utils'
import { useFirebaseUpload, UploadOptions } from '@/services/upload/firebase.service'

interface FirebaseSingleImageUploadProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  uploadOptions?: UploadOptions
}

export function FirebaseSingleImageUpload({
  value = '',
  onChange,
  placeholder = 'Upload image or enter URL',
  className,
  disabled = false,
  uploadOptions = {}
}: FirebaseSingleImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { uploadSingle, isConfigured } = useFirebaseUpload()

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (disabled) return

      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true)
      } else if (e.type === 'dragleave') {
        setDragActive(false)
      }
    },
    [disabled]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      const imageFile = files.find((file) => file.type.startsWith('image/'))

      if (imageFile) {
        await handleFileUpload(imageFile)
      }
    },
    [disabled]
  )

  const handleFileUpload = async (file: File) => {
    if (disabled || !isConfigured) {
      if (!isConfigured) {
        alert('Firebase Storage chưa được cấu hình. Vui lòng kiểm tra Firebase configuration.')
      }
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)

      const result = await uploadSingle(file, uploadOptions, (progress) => {
        setUploadProgress(progress)
      })

      onChange(result.downloadURL)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()

      if (disabled) return

      const file = e.target.files?.[0]
      if (file && file.type.startsWith('image/')) {
        await handleFileUpload(file)
      }

      // Reset the input value so the same file can be selected again
      e.target.value = ''
    },
    [disabled]
  )

  const handleUrlAdd = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput('')
      setShowUrlInput(false)
    }
  }

  const handleRemove = () => {
    if (!disabled) {
      onChange('')
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Cảnh báo nếu Firebase chưa được cấu hình */}
      {!isConfigured && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <p className='text-sm text-yellow-800'>⚠️ Firebase Storage chưa được cấu hình đúng cách.</p>
          <p className='text-xs text-yellow-700 mt-1'>Vui lòng kiểm tra Firebase configuration và Storage rules.</p>
        </div>
      )}

      {/* Current Image Display */}
      {value && !isUploading && (
        <div className='relative inline-block'>
          <img
            src={value}
            alt='Preview'
            className='w-32 h-32 object-cover rounded-lg border'
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/placeholder-image.jpg'
            }}
          />
          <Button
            type='button'
            variant='destructive'
            size='sm'
            className='absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full'
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className='h-3 w-3' />
          </Button>

          {/* Firebase Badge */}
          <div className='absolute -bottom-2 -right-2'>
            <Badge variant='outline' className='text-xs bg-white'>
              Firebase
            </Badge>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className='w-32 h-32 rounded-lg border bg-gray-100 flex flex-col items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-gray-400 mb-2' />
          <div className='text-xs text-gray-600'>{uploadProgress}%</div>
          <div className='w-20 h-1 bg-gray-200 rounded mt-1'>
            <div
              className='h-full bg-blue-500 rounded transition-all duration-300'
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Area (only show when no image and not uploading) */}
      {!value && !isUploading && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && isConfigured && 'hover:border-primary/50 cursor-pointer',
            !isConfigured && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type='file'
            accept='image/*'
            onChange={handleFileInputChange}
            disabled={disabled || !isConfigured}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed'
          />

          <div className='space-y-2'>
            <ImageIcon className='mx-auto h-8 w-8 text-muted-foreground' />
            <div className='text-sm text-muted-foreground'>
              <p className='font-medium'>{placeholder}</p>
              <p>
                {!isConfigured
                  ? 'Cần cấu hình Firebase Storage'
                  : disabled
                    ? 'Upload đã bị vô hiệu hóa'
                    : 'Kéo thả hoặc nhấp để chọn'}
              </p>
              <p className='text-xs'>PNG, JPG, GIF tối đa 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Section */}
      {!value && !isUploading && (
        <div className='space-y-2'>
          {!showUrlInput ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setShowUrlInput(true)}
              disabled={disabled}
              className='w-full'
            >
              <Link className='h-4 w-4 mr-2' />
              Hoặc nhập URL ảnh
            </Button>
          ) : (
            <div className='flex gap-2'>
              <Input
                type='url'
                placeholder='https://example.com/image.jpg'
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={disabled}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlAdd()
                  }
                }}
              />
              <Button type='button' size='sm' onClick={handleUrlAdd} disabled={disabled || !urlInput.trim()}>
                Thêm
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowUrlInput(false)
                  setUrlInput('')
                }}
                disabled={disabled}
              >
                Hủy
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
