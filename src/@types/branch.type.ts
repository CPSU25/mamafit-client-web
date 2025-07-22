export interface ManageBranchType {
  id: string
  branchManagerId: string
  name: string
  description: string
  openingHour: string
  images: string[]
  mapId: string
  province: string
  district: string
  ward: string
  street: string
  latitude: number
  longitude: number
}

// API Request type based on actual API schema
export interface BranchRequest {
  branchManagerId: string
  name: string
  description: string
  openingHour: string
  images: string[]
  mapId: string
  province: string
  district: string
  ward: string
  street: string
  latitude: number
  longitude: number
}
