export type UserRole = 'Admin' | 'BranchManager' | 'Designer' | 'Manager' | 'Staff' | 'BranchStaff' | 'User'

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

export interface PermissionResponse {
  userName: string
  userEmail: string
  roleName: string
  profilePicture: string
}
