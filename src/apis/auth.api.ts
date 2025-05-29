import { ItemBaseResponse } from '@/@types/response'
import { LoginResponse } from '@/@types/user'
import { SignInSchemaType } from '@/features/auth/sign-in/validators'
import { api } from '@/lib/axios/axios'

const authAPI = {
  login: (body: SignInSchemaType) => api.post<ItemBaseResponse<LoginResponse>>('/auth/signin', body)
}

export default authAPI
