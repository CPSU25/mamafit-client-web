import QueryProvider from '@/components/providers/query.provider'
import ThemeProvider from '@/components/providers/theme.provider'
import { AuthProvider } from '@/context/auth-context'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useSignalRAutoConnect } from '@/hooks/useSignalRAutoConnect'
import { useUnifiedHubAutoConnect } from '@/services/signalr'

export default function AppLayout() {
  // Auto-connect/disconnect SignalR based on authentication status
  useSignalRAutoConnect()
  
  // Auto-connect/disconnect UnifiedHub based on authentication status
  useUnifiedHubAutoConnect(true)

  return (
    <QueryProvider>
      <ThemeProvider defaultTheme='light' storageKey='ui-theme'>
        <AuthProvider>
          <Outlet />
          <Toaster position='top-right' />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
