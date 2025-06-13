import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 404s or 403s; retry other errors up to 2 times
        if (error.response?.status === 404 || error.response?.status === 403) return false
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better performance
      refetchOnWindowFocus: false, // Disable auto refetch on window focus
      refetchOnReconnect: true, // Refetch when internet connection is restored
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
      retryDelay: 1000, // 1 second delay for mutation retries
    },
  },
})

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
