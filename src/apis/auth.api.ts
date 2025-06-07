import { ItemBaseResponse } from '@/@types/response'
import { LoginResponse, LogoutBody, PermissionResponse } from '@/@types/user'
import { SignInSchemaType } from '@/features/auth/sign-in/validators'
import { api } from '@/lib/axios/axios'

const authAPI = {
  login: (body: SignInSchemaType) => api.post<ItemBaseResponse<LoginResponse>>('/auth/signin', body),
  logout: (body: LogoutBody) => api.post<ItemBaseResponse<null>>('/auth/logout', body),
  permission: () => api.get<ItemBaseResponse<PermissionResponse>>('/auth/permission')
}

export default authAPI
