import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../zustand/use-auth-store'

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
  }
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
    console.log('🚨 API Error:', {
      status: error.response?.status,
      message: (error.response?.data as { message: string }).message,
      url: error.config?.url
    })

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const authStore = useAuthStore.getState()

    if (
      error.response?.status === 403 &&
      !originalRequest?._retry &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error.response?.data as any)?.message === 'Token is expired' &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      if (!originalRequest?._retry) originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true

        try {
          const { accessToken } = await refresh()
          isRefreshing = false

          failedRequestsQueue.forEach(({ resolve }) => resolve(accessToken))
          failedRequestsQueue = []

          return api(originalRequest)
        } catch (refreshError) {
          failedRequestsQueue.forEach(({ reject }) => reject(refreshError as AxiosError))
          failedRequestsQueue = []
          authStore.clear()
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          resolve: (newAccessToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            resolve(api(originalRequest))
          },
          reject: (error: AxiosError) => {
            reject(error)
          }
        })
      })
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
    const { data } = await api.post<{
      accessToken: string
      refreshToken: string
    }>('/auth/refresh-token', { refreshToken: currentRefreshToken })

    if (data.accessToken && data.refreshToken) {
      save({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      })
      return data
    }

    return { accessToken: '', refreshToken: '' }
  } catch (error) {
    console.error('Refresh token error:', error)
    throw error
  }
}
