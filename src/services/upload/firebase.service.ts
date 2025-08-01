import { initializeApp } from 'firebase/app'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  StorageError,
  UploadTaskSnapshot
} from 'firebase/storage'
import { toast } from 'sonner'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

// Types for upload response
export interface FirebaseUploadResponse {
  downloadURL: string
  fullPath: string
  name: string
  bucket: string
  size: number
  timeCreated: string
  contentType: string
}

export interface UploadOptions {
  folder?: string
  fileName?: string
  metadata?: {
    customMetadata?: Record<string, string>
    contentType?: string
  }
}

class FirebaseStorageService {
  private storage = storage
  private basePath = 'images/' // Default folder path

  constructor() {
    // Firebase tự động khởi tạo với config ở trên
  }

  /**
   * Generate unique filename
   */
  private generateFileName(originalName: string, customName?: string): string {
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)

    if (customName) {
      const extension = originalName.split('.').pop()
      return `${customName}_${timestamp}_${randomStr}.${extension}`
    }

    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
    const extension = originalName.split('.').pop()
    return `${nameWithoutExt}_${timestamp}_${randomStr}.${extension}`
  }

  /**
   * Upload single image to Firebase Storage
   */
  async uploadImage(
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<FirebaseUploadResponse> {
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

      // Create file path
      const folderPath = options.folder || this.basePath
      const fileName = this.generateFileName(file.name, options.fileName)
      const fullPath = `${folderPath}${fileName}`

      // Create storage reference
      const storageRef = ref(this.storage, fullPath)

      // Set metadata
      const metadata = {
        contentType: file.type,
        ...options.metadata
      }

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file, metadata)

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            // Progress monitoring
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            if (onProgress) {
              onProgress(Math.round(progress))
            }
          },
          (error: StorageError) => {
            // Handle upload errors
            console.error('Firebase upload error:', error)
            reject(new Error(error.message))
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

              const result: FirebaseUploadResponse = {
                downloadURL,
                fullPath: uploadTask.snapshot.ref.fullPath,
                name: uploadTask.snapshot.ref.name,
                bucket: uploadTask.snapshot.ref.bucket,
                size: uploadTask.snapshot.totalBytes,
                timeCreated: new Date().toISOString(),
                contentType: file.type
              }

              resolve(result)
            } catch (error) {
              reject(error)
            }
          }
        )
      })
    } catch (error) {
      console.error('Firebase upload error:', error)
      throw error
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<FirebaseUploadResponse[]> {
    try {
      let completedUploads = 0
      const totalFiles = files.length

      const uploadPromises = files.map((file, index) => {
        const fileOptions = { ...options }

        // Add index to filename if custom fileName provided
        if (fileOptions.fileName) {
          fileOptions.fileName = `${fileOptions.fileName}_${index}`
        }

        return this.uploadImage(file, fileOptions, (fileProgress) => {
          // Calculate overall progress
          if (onProgress) {
            const overallProgress = (completedUploads * 100 + fileProgress) / totalFiles
            onProgress(Math.round(overallProgress))
          }
        }).then((result) => {
          completedUploads++
          return result
        })
      })

      const results = await Promise.all(uploadPromises)
      return results
    } catch (error) {
      console.error('Multiple upload error:', error)
      throw error
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(fullPath: string): Promise<boolean> {
    try {
      const imageRef = ref(this.storage, fullPath)
      await deleteObject(imageRef)
      return true
    } catch (error) {
      console.error('Delete image error:', error)
      return false
    }
  }

  /**
   * Get file URL (for existing files)
   */
  async getFileURL(fullPath: string): Promise<string> {
    try {
      const fileRef = ref(this.storage, fullPath)
      const url = await getDownloadURL(fileRef)
      return url
    } catch (error) {
      console.error('Get file URL error:', error)
      throw error
    }
  }

  /**
   * Check if Firebase is configured properly
   */
  isConfigured(): boolean {
    return !!this.storage
  }
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService()

// Export hooks for React components
export const useFirebaseUpload = () => {
  const uploadSingle = async (
    file: File,
    options: UploadOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<FirebaseUploadResponse> => {
    try {
      if (onProgress) onProgress(0)

      const result = await firebaseStorageService.uploadImage(file, options, onProgress)

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
  ): Promise<FirebaseUploadResponse[]> => {
    try {
      if (onProgress) onProgress(0)

      const results = await firebaseStorageService.uploadMultipleImages(files, options, onProgress)

      toast.success(`${results.length} ảnh đã được upload thành công!`)
      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(`Upload thất bại: ${errorMessage}`)
      throw error
    }
  }

  const deleteImage = async (fullPath: string): Promise<boolean> => {
    try {
      const success = await firebaseStorageService.deleteImage(fullPath)
      if (success) {
        toast.success('Ảnh đã được xóa thành công!')
      } else {
        toast.error('Không thể xóa ảnh')
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error(`Xóa ảnh thất bại: ${errorMessage}`)
      return false
    }
  }

  return {
    uploadSingle,
    uploadMultiple,
    deleteImage,
    isConfigured: firebaseStorageService.isConfigured(),
    getFileURL: firebaseStorageService.getFileURL.bind(firebaseStorageService)
  }
}
