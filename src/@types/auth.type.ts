export type SystemRole = 'Admin' | 'BranchManager' | 'Designer' | 'Manager' | 'Staff'
export type ClientRole = 'User'
export type UserRole = SystemRole | ClientRole

export interface User {
  id?: string // Optional for backward compatibility
  userId?: string // Primary user ID from JWT
  name: string
  email: string
  role: UserRole
  avatar?: string
  username?: string // Add username field
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

