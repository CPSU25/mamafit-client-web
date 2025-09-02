import QueryProvider from '@/components/providers/query.provider'
import ThemeProvider from '@/components/providers/theme.provider'
import { AuthProvider } from '@/context/auth-context'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { useSignalRAutoConnect } from '@/hooks/useSignalRAutoConnect'
import { useNotificationSignalR } from '@/hooks/use-notification-signalr'
import { useTaskUpdates } from '@/hooks/use-task-updates'

// Component wrapper để đảm bảo hooks chạy sau QueryProvider
function SignalRManager() {
  // Auto-connect/disconnect SignalR based on authentication status
  useSignalRAutoConnect()
  useNotificationSignalR()
  
  // 🔥 Listen for task updates and real-time UI updates
  useTaskUpdates()

  return null // Component này chỉ chạy hooks, không render gì
}

export default function AppLayout() {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme='light' storageKey='ui-theme'>
        <AuthProvider>
          {/* SignalR hooks chạy sau khi QueryProvider đã được setup */}
          <SignalRManager />
          <Outlet />
          <Toaster position='top-right' />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
