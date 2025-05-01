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
        // Don’t retry 404s; retry other errors up to 2 times
        if (error.response?.status === 404) return false
        return failureCount < 2
      },
      retryDelay: 3000,
      staleTime: 1000 * 60 * 1 // 1 minute
    }
  }
})

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
