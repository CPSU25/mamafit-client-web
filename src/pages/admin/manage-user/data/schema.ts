import { z } from 'zod'
import { ManageUserType } from '@/@types/admin.types'

const userStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type UserStatus = z.infer<typeof userStatusSchema>

const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('manager'),
  z.literal('user'),
  z.literal('staff'),
  z.literal('designer'),
  z.literal('branchmanager')
])

// Updated schema to match ManageUserType from API
const userSchema = z.object({
  id: z.string(),
  userName: z.string().nullable(),
  userEmail: z.string(),
  dateOfBirth: z.string().nullable(),
  profilePicture: z.string().nullable(),
  phoneNumber: z.string(),
  roleName: z.string().nullable(),
  jobTitle: z.string().nullable(),
  fullName: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isVerify: z.boolean(),
  status: userStatusSchema,
  role: userRoleSchema
})

export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

// Helper function to transform ManageUserType to User format
export const transformManageUserToUser = (apiUser: ManageUserType): User => {
  const status: UserStatus = apiUser.isVerify ? 'active' : 'inactive'

  // Safely handle all nullable fields with fallbacks
  const userName = apiUser.userName || 'N/A'
  const dateOfBirth = apiUser.dateOfBirth || 'N/A'
  const profilePicture = apiUser.profilePicture || ''
  const roleName = apiUser.roleName || 'N/A'
  const jobTitle = apiUser.jobTitle || 'N/A'
  const fullName = apiUser.fullName || 'N/A'

  // Map roleName to role enum, default to 'user' if unknown
  const role = (() => {
    const normalizedRole = roleName.toLowerCase()
    if (['admin', 'manager', 'user', 'staff', 'designer', 'branchmanager'].includes(normalizedRole)) {
      return normalizedRole as 'admin' | 'manager' | 'user' | 'staff' | 'designer' | 'branchmanager'
    }
    return 'user' as const
  })()

  return {
    id: apiUser.id,
    userName,
    userEmail: apiUser.userEmail,
    dateOfBirth,
    profilePicture,
    phoneNumber: apiUser.phoneNumber,
    roleName,
    jobTitle,
    fullName,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    isVerify: apiUser.isVerify,
    status,
    role
  }
}
