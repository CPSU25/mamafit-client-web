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
    icon: Shield
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: Shield
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: Users
  },
  {
    label: 'User',
    value: 'user',
    icon: User
  },
  {
    label: 'Staff',
    value: 'staff',
    icon: ShoppingCart
  },
  {
    label: 'Designer',
    value: 'designer',
    icon: PenTool
  }
] as const
