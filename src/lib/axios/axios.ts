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

            // Reject tất cả requests đang chờ
            failedRequestsQueue.forEach(({ reject }) => reject(refreshError as AxiosError))
            failedRequestsQueue = []

            // Clear auth state và redirect
            authStore.clear()

            // Redirect to login nếu refresh fail
            

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

    return Promise.reject(error)
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
