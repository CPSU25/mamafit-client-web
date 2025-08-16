import { z } from 'zod'
import { MaternityDressList, MaternityDressType } from '@/@types/inventory.type'

const maternityDressStatusSchema = z.union([z.literal('ACTIVE'), z.literal('INACTIVE')])
export type MaternityDressStatus = z.infer<typeof maternityDressStatusSchema>

const maternityDressSchema = z.object({
  id: z.string(),
  styleName: z.string(),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  slug: z.string(),
  price: z.number(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string(),
  updatedBy: z.string().nullable(),
  status: maternityDressStatusSchema.optional().default('ACTIVE')
})

export type MaternityDress = z.infer<typeof maternityDressSchema>

export const maternityDressListSchema = z.array(maternityDressSchema)

export const transformMaternityDressTypeToMaternityDress = (apiMaternityDress: MaternityDressType): MaternityDress => {
  return {
    id: apiMaternityDress.id,
    styleName: apiMaternityDress.styleName,
    name: apiMaternityDress.name,
    description: apiMaternityDress.description,
    images: apiMaternityDress.images || [],
    slug: apiMaternityDress.slug,
    price: apiMaternityDress.price,
    createdAt: apiMaternityDress.createdAt,
    updatedAt: apiMaternityDress.updatedAt,
    createdBy: apiMaternityDress.createdBy,
    updatedBy: apiMaternityDress.updatedBy,
    status: 'ACTIVE'
  }
}

export const transformMaternityDressListToMaternityDress = (apiMaternityDress: MaternityDressList): MaternityDress => {
  return {
    id: apiMaternityDress.id,
    styleName: apiMaternityDress.styleName,
    name: apiMaternityDress.name,
    description: apiMaternityDress.description,
    images: apiMaternityDress.images || [],
    slug: apiMaternityDress.slug,
    price: apiMaternityDress.price,
    createdAt: apiMaternityDress.createdAt,
    updatedAt: apiMaternityDress.updatedAt,
    createdBy: apiMaternityDress.createdBy,
    updatedBy: apiMaternityDress.updatedBy,
    status: 'ACTIVE'
  }
}

// Form data types (re-export from inventory.type.ts for convenience)
export type { MaternityDressFormData } from '@/@types/inventory.type'
