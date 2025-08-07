export interface ManageBranchType {
  id: string
  name: string
  branchManager: BranchManagerType
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
export interface BranchManagerType{
  id: string
  fullName: string 
  phoneNumber: string
  userEmail: string 
  userName: string 
}
// API Request type based on actual API schema
export interface BranchRequest {
  branchManagerId: string
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
