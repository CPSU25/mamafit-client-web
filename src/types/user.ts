export type UserRole = 'admin' | 'branch_manager' | 'designer' | 'factory_manager'

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
