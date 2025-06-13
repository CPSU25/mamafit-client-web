import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/apis'
import { toast } from 'sonner'
import { signInSchema, SignInSchemaType } from './validators'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useNavigate } from 'react-router'
import { ErrorType } from '@/@types/response'
// import { useAuthStore } from '@/lib/zustand/use-auth-store'

const defaultValues: SignInSchemaType = {
  // identifier: '',
  identifier: '',
  password: ''
}

// Helper function to get dashboard route based on role
const getDashboardRoute = (role: string) => {
  switch (role) {
    case 'Admin':
      return '/system/admin/dashboard'
    case 'BranchManager':
      return '/system/branch/dashboard'
    case 'Designer':
      return '/system/designer/dashboard'
    case 'Manager':
      return '/system/factory-manager/dashboard'
    default:
      return '/system/sign-in' // fallback to login if role not recognized
  }
}

export const useSignIn = () => {
  const navigate = useNavigate()
  const methods = useForm<SignInSchemaType>({
    defaultValues,
    resolver: zodResolver(signInSchema)
  })
  const { save } = useAuthStore()
  const signInMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      methods.reset()
      toast.success('Sign in successfully!!!', {
        id: 'sign-in-success',
        description: 'Welcome back!'
      })

      // Save tokens first
      save({ accessToken: data.data.data.accessToken, refreshToken: data.data.data.refreshToken })

      // Get user info from the saved state and redirect based on role
      setTimeout(() => {
        const currentUser = useAuthStore.getState().user
        if (currentUser && currentUser.role) {
          const dashboardRoute = getDashboardRoute(currentUser.role)
          navigate(dashboardRoute)
        } else {
          // Fallback if user data is not available
          navigate('/system')
        }
      }, 100) // Small delay to ensure state is updated
    },
    onError: (error: ErrorType) => {
      toast.error('Sign in failed, please try again!!!', {
        id: 'sign-in-error',
        description: error.response?.data?.errorMessage
      })
    }
  })

  return { methods, signInMutation, isPending: signInMutation.isPending }
}
