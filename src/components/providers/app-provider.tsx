import { Toaster } from '../ui/sonner'
import { ThemeProvider } from './theme-provider'

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme='light' storageKey='ui-theme'>
      {children}
      <Toaster position='top-right' />
    </ThemeProvider>
  )
}
