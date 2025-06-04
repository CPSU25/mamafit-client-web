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
      save({ accessToken: data.data.data.accessToken, refreshToken: data.data.data.refreshToken })
      navigate('/')
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
