export type UserRole = 'Admin' | 'Branch' | 'Designer' | 'Factory'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  indifier: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
}

export interface LogoutBody {
  refreshToken: string
}
