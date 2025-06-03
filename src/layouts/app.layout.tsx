import QueryProvider from '@/components/providers/query.provider'
import ThemeProvider from '@/components/providers/theme.provider'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme='light' storageKey='ui-theme'>
        <Outlet />
        <Toaster position='top-right' />
      </ThemeProvider>
    </QueryProvider>
  )
}
