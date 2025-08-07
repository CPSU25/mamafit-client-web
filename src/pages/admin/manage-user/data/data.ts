import { PenTool, Shield, ShoppingCart, User, Users } from 'lucide-react'
import { UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300']
])

export const userTypes = [
  {
    label: 'BranchManager',
    value: 'branchmanager',
    roleId: '1', // Assuming roleId for BranchManager
    icon: Shield
  },
  {
    label: 'Admin',
    value: 'admin',
    roleId: '2', // Assuming roleId for Admin
    icon: Shield
  },
  {
    label: 'Manager',
    value: 'manager',
    roleId: '3', // Assuming roleId for Manager
    icon: Users
  },
  {
    label: 'User',
    value: 'user',
    roleId: '4', // Assuming roleId for User
    icon: User
  },
  {
    label: 'Staff',
    value: 'staff',
    roleId: '5', // Assuming roleId for Staff
    icon: ShoppingCart
  },
  {
    label: 'Designer',
    value: 'designer',
    roleId: '6', // Assuming roleId for Designer
    icon: PenTool
  }
] as const

// Helper function to get roleId from role name
export const getRoleIdByValue = (roleValue: string): string => {
  const roleType = userTypes.find((type) => type.value === roleValue)
  return roleType?.roleId || '4' // Default to User role if not found
}
