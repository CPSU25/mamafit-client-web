import { z } from 'zod'

export const addAddressFormSchema = z.object({
  mapId: z.string().min(1, { message: 'Map ID is required' }).trim(),
  province: z.string().min(1, { message: 'Province is required' }).trim(),
  district: z.string().min(1, { message: 'District is required' }).trim(),
  ward: z.string().min(1, { message: 'Ward is required' }).trim(),
  street: z.string().min(1, { message: 'Street is required' }).trim(),
  latitude: z.number().min(-90).max(90, { message: 'Invalid latitude' }),
  longitude: z.number().min(-180).max(180, { message: 'Invalid longitude' })
})

export type AddAddressFormSchema = z.infer<typeof addAddressFormSchema>

export const branchLocationSchema = z.object({
  mapId: z.string().optional(),
  province: z.string().min(1, { message: 'Province is required' }).trim(),
  district: z.string().min(1, { message: 'District is required' }).trim(),
  ward: z.string().min(1, { message: 'Ward is required' }).trim(),
  street: z.string().min(1, { message: 'Street is required' }).trim(),
  latitude: z.number(),
  longitude: z.number()
})

export type BranchLocationSchema = z.infer<typeof branchLocationSchema>
