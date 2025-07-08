export interface ManageBranchType {
  id: string
  branchManagerId: string
  name: string
  description: string
  openingHours: string
  images: string[]
  mapId: string
  shortName: string
  longName: string
  latitude: number
  longitude: number
}

// API Request type based on actual API schema
export interface BranchRequest {
  branchManagerId: string
  name: string
  description: string
  openingHours: string
  images: string[]
  mapId: string
  shortName: string
  longName: string
  latitude: number
  longitude: number
}
