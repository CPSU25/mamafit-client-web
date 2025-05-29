import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/apis'
import { toast } from 'sonner'
import { signInSchema, SignInSchemaType } from './validators'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useNavigate } from 'react-router'
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
      toast.success('Sign in successful!')
      methods.reset()
      save({ accessToken: data.data.data.accessToken, refreshToken: data.data.data.refreshToken })
      navigate('/')
    }
  })

  return { methods, signInMutation, isPending: signInMutation.isPending }
}
