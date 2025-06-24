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

export type BranchRequest = Omit<ManageBranchType, 'id'>
