import { toast } from 'sonner'

// Types for upload response
export interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  resource_type: string
  bytes: number
  created_at: string
}

export interface UploadOptions {
  // Chỉ các parameter được phép với unsigned upload
  folder?: string
  public_id?: string
  tags?: string | string[]
  context?: Record<string, string>

  // Transformation options (áp dụng qua URL sau upload)
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad'
  quality?: 'auto' | number
  format?: 'auto' | 'jpg' | 'png' | 'webp'
}

class CloudinaryService {
  private cloudName: string
  private uploadPreset: string

  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

    if (!this.cloudName || !this.uploadPreset) {
      console.error(
        'Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET'
      )
    }
  }

  /**
   * Upload ảnh lên Cloudinary
   */
  async uploadImage(file: File, options: UploadOptions = {}): Promise<CloudinaryUploadResponse> {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      // Tạo FormData - CHỈ sử dụng các parameter được phép với unsigned upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.uploadPreset)

      // Chỉ thêm các parameters được phép cho unsigned upload
      if (options.folder) {
        formData.append('folder', options.folder)
      }

      if (options.public_id) {
        formData.append('public_id', options.public_id)
      }

      if (options.tags) {
        const tags = Array.isArray(options.tags) ? options.tags.join(',') : options.tags
        formData.append('tags', tags)
      }

      if (options.context) {
        formData.append(
          'context',
          Object.entries(options.context)
            .map(([key, value]) => `${key}=${value}`)
            .join('|')
        )
      }

      // Upload lên Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Upload failed')
      }

      const result = await response.json()

      // Áp dụng transformations qua URL nếu cần
      if (this.needsTransformation(options)) {
        result.secure_url = this.buildTransformedUrl(result.public_id, options)
        result.url = result.secure_url.replace('https://', 'http://')
      }

      return result as CloudinaryUploadResponse
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw error
    }
  }

  /**
   * Kiểm tra xem có cần transformation không
   */
  private needsTransformation(options: UploadOptions): boolean {
    return !!(options.width || options.height || options.crop || options.quality || options.format)
  }

  /**
   * Tạo URL với transformation
   */
  private buildTransformedUrl(publicId: string, options: UploadOptions): string {
    const transformations: string[] = []

    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.crop) transformations.push(`c_${options.crop}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format) transformations.push(`f_${options.format}`)

    const transformString = transformations.join(',')

    return transformString
      ? `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}/${publicId}`
      : `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}`
  }

  /**
   * Upload nhiều ảnh cùng lúc
   */
  async uploadMultipleImages(files: File[], options: UploadOptions = {}): Promise<CloudinaryUploadResponse[]> {
    try {
      const uploadPromises = files.map((file, index) => {
        const fileOptions = { ...options }

        // Thêm index vào public_id nếu có
        if (fileOptions.public_id) {
          fileOptions.public_id = `${fileOptions.public_id}_${index}`
        }

        return this.uploadImage(file, fileOptions)
      })

      const results = await Promise.all(uploadPromises)
      return results
    } catch (error) {
      console.error('Multiple upload error:', error)
      throw error
    }
  }

  /**
   * Delete ảnh từ Cloudinary (requires API secret - thường làm từ backend)
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      // Note: Việc xóa ảnh thường được thực hiện từ backend vì cần API secret
      // Đây chỉ là placeholder method
      console.warn(`Delete image should be implemented on backend for security reasons. Public ID: ${publicId}`)

      // Nếu bạn muốn implement client-side deletion (không recommended):
      // Cần signed delete với API secret từ backend

      return true
    } catch (error) {
      console.error('Delete image error:', error)
      return false
    }
  }

  /**
   * Tạo URL với transformation
   */
  getTransformedUrl(publicId: string, transformations: Record<string, string | number>[] = []): string {
    if (!publicId) return ''

    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`

    if (transformations.length === 0) {
      return `${baseUrl}/${publicId}`
    }

    const transformString = transformations
      .map((t) =>
        Object.entries(t)
          .map(([key, value]) => `${key}_${value}`)
          .join(',')
      )
      .join('/')

    return `${baseUrl}/${transformString}/${publicId}`
  }

  /**
   * Tạo URL thumbnail
   */
  getThumbnailUrl(publicId: string, width: number = 150, height: number = 150): string {
    return this.getTransformedUrl(publicId, [{ w: width, h: height, c: 'fill', q: 'auto', f: 'auto' }])
  }

  /**
   * Validate Cloudinary configuration
   */
  isConfigured(): boolean {
    return !!(this.cloudName && this.uploadPreset)
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService()

// Export hooks for React components
export const useCloudinaryUpload = () => {
  const uploadSingle = async (
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResponse> => {
    try {
      if (onProgress) onProgress(0)

      const result = await cloudinaryService.uploadImage(file, options)

      if (onProgress) onProgress(100)

      toast.success('Ảnh đã được upload thành công!')
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(`Upload thất bại: ${errorMessage}`)
      throw error
    }
  }

  const uploadMultiple = async (
    files: File[],
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResponse[]> => {
    try {
      if (onProgress) onProgress(0)

      const results = await cloudinaryService.uploadMultipleImages(files, options)

      if (onProgress) onProgress(100)

      toast.success(`${results.length} ảnh đã được upload thành công!`)
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(`Upload thất bại: ${errorMessage}`)
      throw error
    }
  }

  return {
    uploadSingle,
    uploadMultiple,
    isConfigured: cloudinaryService.isConfigured(),
    getTransformedUrl: cloudinaryService.getTransformedUrl.bind(cloudinaryService),
    getThumbnailUrl: cloudinaryService.getThumbnailUrl.bind(cloudinaryService)
  }
}
