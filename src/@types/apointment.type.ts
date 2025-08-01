export interface User {
  id: string
  userName: string
  userEmail: string
  phoneNumber: string
  dateOfBirth?: string
  profilePicture?: string
  fullName: string
  roleName: string
  isVerify: boolean
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}

export interface BranchManager {
  id: string
  userName: string
  userEmail: string
  phoneNumber: string
  dateOfBirth?: string
  profilePicture?: string
  fullName: string
  roleName: string
  isVerify: boolean
  createdAt: string
  createdBy?: string
  updatedAt: string
  updatedBy?: string
}

export interface Branch {
  id: string
  branchManager: BranchManager
  name: string
  description: string
  openingHour: string
  closingHour: string
  images: string[]
  mapId: string
  province: string
  district: string
  ward: string
  street: string
  latitude: number
  longitude: number
}

export enum AppointmentStatus {
  UP_COMING = 'UP_COMING',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface Appointment {
  id: string
  user: User
  branch: Branch
  bookingTime: string
  note: string
  status: AppointmentStatus
  canceledAt?: string
  canceledReason?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface AppointmentStats {
  totalAppointments: number
  upComing: number
  inProgress: number
  completed: number
  canceled: number
}

export interface AppointmentFilters {
  status?: AppointmentStatus
  date?: Date
  searchTerm?: string
  branchId?: string
}

export interface CreateAppointmentData {
  userId: string
  branchId: string
  bookingTime: string
  note?: string
}

export interface UpdateAppointmentData {
  status?: AppointmentStatus
  bookingTime?: string
  note?: string
  canceledReason?: string
}
