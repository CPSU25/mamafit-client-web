import { ManageBranchType } from '@/@types/branch.type'
import { z } from 'zod'

// Use ManageBranchType directly as our Branch type
export type Branch = ManageBranchType

export const branchListSchema = z.array(z.custom<Branch>())

// Helper function to transform ManageBranchType to Branch format (they're the same now)
export const transformManageBranchTypeToBranch = (apiBranch: ManageBranchType): Branch => {
  return {
    id: apiBranch.id,
    branchManagerId: apiBranch.branchManagerId,
    name: apiBranch.name,
    description: apiBranch.description,
    openingHours: apiBranch.openingHours,
    images: apiBranch.images,
    mapId: apiBranch.mapId,
    province: apiBranch.province,
    district: apiBranch.district,
    ward: apiBranch.ward,
    street: apiBranch.street,
    latitude: apiBranch.latitude,
    longitude: apiBranch.longitude
  }
}
