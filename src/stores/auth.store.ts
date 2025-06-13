import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AuthUIState {
  // Dialog/Form States
  isLoginDialogOpen: boolean
  isRegistrationDialogOpen: boolean
  isForgotPasswordDialogOpen: boolean
  
  // Remember me state
  rememberMe: boolean
  
  // Navigation state after login
  redirectAfterLogin: string | null
  
  // Actions - UI State Only
  setLoginDialogOpen: (open: boolean) => void
  setRegistrationDialogOpen: (open: boolean) => void
  setForgotPasswordDialogOpen: (open: boolean) => void
  setRememberMe: (remember: boolean) => void
  setRedirectAfterLogin: (path: string | null) => void
  
  // Helper action to close all dialogs
  closeAllDialogs: () => void
}

export const useAuthStore = create<AuthUIState>()(
  devtools(
    (set) => ({
      // Initial state
      isLoginDialogOpen: false,
      isRegistrationDialogOpen: false,
      isForgotPasswordDialogOpen: false,
      rememberMe: false,
      redirectAfterLogin: null,

      // Dialog management
      setLoginDialogOpen: (open) => set({ isLoginDialogOpen: open }),
      
      setRegistrationDialogOpen: (open) => set({ isRegistrationDialogOpen: open }),
      
      setForgotPasswordDialogOpen: (open) => set({ isForgotPasswordDialogOpen: open }),
      
      // Remember me
      setRememberMe: (remember) => set({ rememberMe: remember }),
      
      // Redirect management
      setRedirectAfterLogin: (path) => set({ redirectAfterLogin: path }),
      
      // Close all dialogs
      closeAllDialogs: () => set({
        isLoginDialogOpen: false,
        isRegistrationDialogOpen: false,
        isForgotPasswordDialogOpen: false,
      }),
    }),
    {
      name: 'auth-ui-store',
    }
  )
)
