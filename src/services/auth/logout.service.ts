import { ErrorType } from '@/@types/response'
import { authAPI } from '@/apis'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

export const useLogout = () => {
  const { clear } = useAuthStore()
  const navigate = useNavigate()

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: (data) => {
      clear()
      toast.success(data.data.message)
      navigate('/system/sign-in')
    },
    onError: (error: ErrorType) => {
      toast.error('Logout failed, please try again!', {
        description: error.response?.data?.errorMessage
      })
    }
  })

  return { logoutMutation, isPending: logoutMutation.isPending }
}
