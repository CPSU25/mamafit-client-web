import QueryProvider from './query-provider'
import ThemeProvider from './theme-provider'
import { Toaster } from '../ui/sonner'

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme='light' storageKey='ui-theme'>
        {children}
        <Toaster position='top-right' />
      </ThemeProvider>
    </QueryProvider>
  )
}
