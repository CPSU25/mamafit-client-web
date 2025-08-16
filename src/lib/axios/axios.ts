import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../zustand/use-auth-store'
import { ItemBaseResponse } from '@/@types/response'

const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL) {
  throw new Error('VITE_API_BASE_URL is not defined')
}

let isRefreshing = false
let failedRequestsQueue: Array<{
  resolve: (token: string) => void
  reject: (error: AxiosError) => void
}> = []

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  timeout: 30000 // 30s timeouta
})

// Helper: Chuẩn hóa message lỗi trả về từ server
type NormalizedAxiosError = AxiosError & {
  userMessage?: string
  errorCode?: string
  validationErrors?: string[]
}

const extractServerErrorMessage = (
  error: AxiosError
): {
  message: string
  errorCode?: string
  validationMessages?: string[]
} => {
  const fallback = 'Đã xảy ra lỗi, vui lòng thử lại sau.'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (error.response?.data ?? {}) as any

  // Một số backend trả về string thuần
  if (typeof data === 'string') {
    return { message: data }
  }

  // Ưu tiên theo chuẩn của hệ thống hiện tại
  if (typeof data?.errorMessage === 'string' && data.errorMessage.trim()) {
    return { message: data.errorMessage, errorCode: data?.errorCode || data?.code }
  }

  // Chuẩn Item/ListBaseResponse: message
  const msg = data?.message
  if (Array.isArray(msg) && msg.length) {
    return { message: msg.join(', ') }
  }
  if (typeof msg === 'string' && msg.trim()) {
    return { message: msg, errorCode: data?.code }
  }

  // Validation errors phổ biến (ASP.NET/FluentValidation)
  const errors = data?.errors
  if (errors) {
    const messages: string[] = []
    if (Array.isArray(errors)) {
      messages.push(...errors.filter((x: unknown) => typeof x === 'string'))
    } else if (typeof errors === 'object') {
      for (const key of Object.keys(errors)) {
        const val = (errors as Record<string, unknown>)[key]
        if (Array.isArray(val)) {
          messages.push(...((val as unknown[]).filter((x) => typeof x === 'string') as string[]))
        } else if (typeof val === 'string') {
          messages.push(val)
        }
      }
    }
    if (messages.length) {
      return { message: messages[0], validationMessages: messages }
    }
  }

  // Một số dạng khác
  if (typeof data?.title === 'string' && data.title.trim()) {
    return { message: data.title }
  }
  if (typeof data?.error?.message === 'string' && data.error.message.trim()) {
    return { message: data.error.message }
  }

  // Fallback
  return { message: error.message || fallback }
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken && config.url !== '/auth/refresh-token' && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error: AxiosError): Promise<AxiosError> => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    }
    const authStore = useAuthStore.getState()

    if (!error.response) {
      // Retry cho network errors (không phải auth issues)
      if (originalRequest && !originalRequest._retry) {
        const retryCount = originalRequest._retryCount || 0

        if (retryCount < 2) {
          // Retry tối đa 2 lần
          originalRequest._retryCount = retryCount + 1
          console.log(`Retrying request... attempt ${retryCount + 1}`)

          // Delay trước khi retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))

          return api(originalRequest)
        }
      }

      return Promise.reject(error)
    }

    // ✅ Xử lý HTTP errors và refresh token
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest?._retry &&
      originalRequest?.url !== '/auth/refresh-token'
    ) {
      // Kiểm tra xem có phải lỗi token expired không
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error.response?.data as any)?.message || ''
      const isTokenExpired =
        errorMessage.includes('Token is expired') || errorMessage.includes('invalid') || error.response?.status === 401

      if (isTokenExpired) {
        originalRequest._retry = true

        if (!isRefreshing) {
          isRefreshing = true

          try {
            const { accessToken } = await refresh()
            isRefreshing = false

            // Resolve tất cả requests đang chờ
            failedRequestsQueue.forEach(({ resolve }) => resolve(accessToken))
            failedRequestsQueue = []

            // Retry original request với token mới
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`
            }
            return api(originalRequest)
          } catch (refreshError) {
            isRefreshing = false
            failedRequestsQueue.forEach(({ reject }) => reject(refreshError as AxiosError))
            failedRequestsQueue = []

            // Clear auth state và redirect
            authStore.clear()

            return Promise.reject(refreshError)
          }
        }

        // Thêm request vào queue nếu đang refresh
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: (newAccessToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
              }
              resolve(api(originalRequest))
            },
            reject: (error: AxiosError) => {
              reject(error)
            }
          })
        })
      }
    }

    // Chuẩn hóa message lỗi cho tất cả case còn lại (bao gồm 400/422 validation)
    const enriched = error as NormalizedAxiosError
    const { message, errorCode, validationMessages } = extractServerErrorMessage(error)
    enriched.userMessage = message
    if (message && enriched.message !== message) enriched.message = message
    if (errorCode) enriched.errorCode = errorCode
    if (validationMessages && validationMessages.length) enriched.validationErrors = validationMessages

    return Promise.reject(enriched)
  }
)

const refresh = async () => {
  const { refreshToken: currentRefreshToken, save } = useAuthStore.getState()

  if (!currentRefreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    const refreshApi = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })

    const response = await refreshApi.post<
      ItemBaseResponse<{
        accessToken: string
        refreshToken: string
      }>
    >('/auth/refresh-token', { refreshToken: currentRefreshToken })

    const { data: responseData } = response
    if (responseData.data.accessToken && responseData.data.refreshToken) {
      save({
        accessToken: responseData.data.accessToken,
        refreshToken: responseData.data.refreshToken
      })
      return responseData.data
    }

    throw new Error('Invalid refresh token response')
  } catch (error) {
    console.error('Refresh token error:', error)
    throw error
  }
}
