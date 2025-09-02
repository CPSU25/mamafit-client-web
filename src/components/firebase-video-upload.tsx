import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, Loader2, Play, Video as VideoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/utils'
import { useFirebaseUpload, UploadOptions } from '@/services/upload/firebase.service'

interface FirebaseVideoUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  className?: string
  placeholder?: string
  accept?: string
  uploadOptions?: UploadOptions
  disabled?: boolean
}

interface UploadedVideo {
  id: string
  url: string
  fullPath?: string
  file?: File
  isUploading?: boolean
  progress?: number
  name?: string
  size?: number
  duration?: number
}

export function FirebaseVideoUpload({
  value = [],
  onChange,
  maxFiles = 3,
  className,
  placeholder = 'Upload videos or enter URL',
  accept = 'video/*',
  uploadOptions = {},
  disabled = false
}: FirebaseVideoUploadProps) {
  const [videos, setVideos] = useState<UploadedVideo[]>(
    value.map((url, index) => ({
      id: `existing-${index}`,
      url,
      name: `Video ${index + 1}`
    }))
  )
  const [urlInput, setUrlInput] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadVideo, isConfigured } = useFirebaseUpload()

  const updateParent = useCallback(
    (newVideos: UploadedVideo[]) => {
      const urls = newVideos.filter((video) => !video.isUploading).map((video) => video.url)
      onChange(urls)
    },
    [onChange]
  )

  // Update videos when value prop changes (initialization only)
  useEffect(() => {
    const existingVideos = value.map((url, index) => ({
      id: `existing-${index}`,
      url,
      name: `Video ${index + 1}`
    }))
    setVideos(existingVideos)
  }, [value])

  // Manual updateParent call - no automatic useEffect to avoid infinite loops

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      video.onerror = () => resolve(0)
      video.src = URL.createObjectURL(file)
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileSelect = async (files: File[]) => {
    if (disabled || !isConfigured) return

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('video/')) {
        return false
      }

      // Check file size (max 100MB)
      const maxSize = 100 * 1024 * 1024
      if (file.size > maxSize) {
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    // Check if adding these files would exceed maxFiles
    const remainingSlots = maxFiles - videos.length
    const filesToUpload = validFiles.slice(0, remainingSlots)

    // Create temporary video objects
    const tempVideos: UploadedVideo[] = await Promise.all(
      filesToUpload.map(async (file) => {
        const duration = await getVideoDuration(file)
        return {
          id: `temp-${Date.now()}-${Math.random()}`,
          url: URL.createObjectURL(file),
          file,
          isUploading: true,
          progress: 0,
          name: file.name,
          size: file.size,
          duration
        }
      })
    )

    // Add temp videos to state
    setVideos((prev) => [...prev, ...tempVideos])

    // Upload videos
    for (const tempVideo of tempVideos) {
      if (!tempVideo.file) continue

      try {
        const result = await uploadVideo(
          tempVideo.file,
          {
            ...uploadOptions,
            folder: uploadOptions.folder || 'videos/'
          },
          (progress) => {
            setUploadProgress(progress)
            setVideos((prev) => prev.map((v) => (v.id === tempVideo.id ? { ...v, progress } : v)))
          }
        )

        // Update video with upload result
        setVideos((prev) =>
          prev.map((v) =>
            v.id === tempVideo.id
              ? {
                  ...v,
                  url: result.downloadURL,
                  fullPath: result.fullPath,
                  isUploading: false,
                  progress: 100
                }
              : v
          )
        )

        // Clean up temp URL
        URL.revokeObjectURL(tempVideo.url)
      } catch (error) {
        console.error('Video upload failed:', error)

        // Remove failed upload
        setVideos((prev) => prev.filter((v) => v.id !== tempVideo.id))
        URL.revokeObjectURL(tempVideo.url)
      }
    }

    setUploadProgress(0)

    // Call updateParent after all uploads complete
    setTimeout(() => {
      setVideos((currentVideos) => {
        updateParent(currentVideos)
        return currentVideos
      })
    }, 100)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    handleFileSelect(files)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFileSelect(files)
    }
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim() || videos.length >= maxFiles) return

    const newVideo: UploadedVideo = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      name: 'External Video'
    }

    setVideos((prev) => {
      const newVideos = [...prev, newVideo]
      updateParent(newVideos)
      return newVideos
    })
    setUrlInput('')
  }

  const removeVideo = (id: string) => {
    setVideos((prev) => {
      const videoToRemove = prev.find((v) => v.id === id)
      if (videoToRemove && videoToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(videoToRemove.url)
      }
      const newVideos = prev.filter((v) => v.id !== id)
      updateParent(newVideos)
      return newVideos
    })
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (!isConfigured) {
    return <div className='text-center py-4 text-muted-foreground'>Firebase not configured for video uploads</div>
  }

  const canAddMore = videos.length < maxFiles && !disabled

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
        >
          <VideoIcon className='mx-auto h-12 w-12 text-muted-foreground mb-4' />
          <p className='text-sm text-muted-foreground mb-4'>
            {placeholder || 'Drop video files here or click to upload'}
          </p>
          <p className='text-xs text-muted-foreground mb-4'>Supports MP4, WebM, AVI up to 100MB each</p>

          <Button type='button' variant='outline' onClick={openFileDialog} disabled={disabled}>
            <Upload className='h-4 w-4 mr-2' />
            Choose Videos
          </Button>

          <input
            ref={fileInputRef}
            type='file'
            accept={accept}
            multiple
            onChange={handleFileInputChange}
            className='hidden'
            disabled={disabled}
          />
        </div>
      )}

      {/* URL Input */}
      {canAddMore && (
        <div className='flex gap-2'>
          <Input
            type='url'
            placeholder='Or paste video URL'
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleUrlAdd()
              }
            }}
            disabled={disabled}
          />
          <Button type='button' variant='outline' onClick={handleUrlAdd} disabled={!urlInput.trim() || disabled}>
            Add
          </Button>
        </div>
      )}

      {/* Video List */}
      {videos.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>
              Videos ({videos.length}/{maxFiles})
            </p>
            {/* Debug info */}
            <span className='text-xs text-blue-600'>Debug: {videos.filter((v) => !v.isUploading).length} uploaded</span>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className='flex items-center gap-2'>
                <Progress value={uploadProgress} className='w-20' />
                <span className='text-xs text-muted-foreground'>{uploadProgress}%</span>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 gap-3'>
            {videos.map((video) => (
              <div key={video.id} className='flex items-center gap-3 p-3 border rounded-lg bg-muted/30'>
                {/* Video Thumbnail/Player */}
                <div className='relative w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0'>
                  {video.isUploading ? (
                    <div className='flex items-center justify-center h-full'>
                      <Loader2 className='h-6 w-6 animate-spin' />
                    </div>
                  ) : (
                    <video src={video.url} className='w-full h-full object-cover' muted playsInline />
                  )}

                  {!video.isUploading && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer'>
                      <Play className='h-4 w-4 text-white' fill='white' />
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>{video.name}</p>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    {video.size && <span>{formatFileSize(video.size)}</span>}
                    {video.duration && <span>{formatDuration(video.duration)}</span>}
                    {video.isUploading && video.progress && (
                      <Badge variant='secondary' className='text-xs'>
                        {video.progress}%
                      </Badge>
                    )}
                  </div>

                  {video.isUploading && <Progress value={video.progress || 0} className='w-full mt-1' />}
                </div>

                {/* Remove Button */}
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => removeVideo(video.id)}
                  disabled={disabled || video.isUploading}
                  className='flex-shrink-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length >= maxFiles && (
        <p className='text-xs text-muted-foreground text-center'>Maximum {maxFiles} videos allowed</p>
      )}
    </div>
  )
}
