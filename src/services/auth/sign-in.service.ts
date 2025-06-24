import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/apis'
import { toast } from 'sonner'
import { signInSchema, SignInSchemaType } from '../../pages/public-page/login-system/validators'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { ErrorType } from '@/@types/response'

const defaultValues: SignInSchemaType = {
  identifier: '',
  password: ''
}

export const useSignIn = () => {
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
      save({ accessToken: data.data.data.accessToken, refreshToken: data.data.data.refreshToken })
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
