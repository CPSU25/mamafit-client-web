import { z } from 'zod'
import { ManageUserType } from '@/@types/manage-user.type'

const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended')
])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager')
])

// Updated schema to match ManageUserType from API
const userSchema = z.object({
  id: z.string(),
  userName: z.string(),
  userEmail: z.string(),
  dateOfBirth: z.string(),
  profilePicture: z.string(),
  phoneNumber: z.string(),
  roleName: z.string(),
  fullName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isVerify: z.boolean(),
  // Derived fields for compatibility
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional()
})

export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

// Helper function to transform ManageUserType to User format
export const transformManageUserToUser = (apiUser: ManageUserType): User => {
  const nameParts = apiUser.fullName?.split(' ') || ['', '']
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  
  // Determine status based on isVerify and other factors
  const status: UserStatus = apiUser.isVerify ? 'active' : 'inactive'
  
  return {
    id: apiUser.id,
    userName: apiUser.userName,
    userEmail: apiUser.userEmail,
    dateOfBirth: apiUser.dateOfBirth,
    profilePicture: apiUser.profilePicture,
    phoneNumber: apiUser.phoneNumber,
    roleName: apiUser.roleName,
    fullName: apiUser.fullName,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    isVerify: apiUser.isVerify,
    // Derived fields for compatibility with existing components
    firstName,
    lastName,
    username: apiUser.userName,
    email: apiUser.userEmail,
    status,
    role: apiUser.roleName.toLowerCase() as 'superadmin' | 'admin' | 'cashier' | 'manager'
  }
}
