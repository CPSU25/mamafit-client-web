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
  userName: z.string(),
  userEmail: z.string(),
  dateOfBirth: z.string(),
  profilePicture: z.string(),
  phoneNumber: z.string(),
  roleName: z.string(),
  jobTitle: z.string().optional(),
  fullName: z.string(),
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

  return {
    id: apiUser.id,
    userName: apiUser.userName,
    userEmail: apiUser.userEmail,
    dateOfBirth: apiUser.dateOfBirth,
    profilePicture: apiUser.profilePicture,
    phoneNumber: apiUser.phoneNumber,
    roleName: apiUser.roleName,
  jobTitle: apiUser.jobTitle,
    fullName: apiUser.fullName,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    isVerify: apiUser.isVerify,
    status,
    role: apiUser.roleName.toLowerCase() as 'admin' | 'manager' | 'user' | 'staff' | 'designer'
  }
}
