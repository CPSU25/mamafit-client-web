import { z } from 'zod'
import { MaternityDressList, MaternityDressType } from '@/@types/manage-maternity-dress.types'

const maternityDressSchema = z.object({
  id: z.string(),
  styleName: z.string(),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  slug: z.string(),
  price: z.array(z.string()),
  sku: z.string().optional(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string(),
  updatedBy: z.string().nullable(),
  globalStatus: z.enum(['ACTIVE', 'INACTIVE']).optional()
})

export type MaternityDress = z.infer<typeof maternityDressSchema>

export const maternityDressListSchema = z.array(maternityDressSchema)

export const transformMaternityDressTypeToMaternityDress = (apiMaternityDress: MaternityDressType): MaternityDress => {
  return {
    id: apiMaternityDress.id,
    styleName: apiMaternityDress.styleName,
    name: apiMaternityDress.name,
    sku: apiMaternityDress.sku || '',
    description: apiMaternityDress.description,
    images: apiMaternityDress.images || [],
    slug: apiMaternityDress.slug,
    price: apiMaternityDress.price,
    createdAt: apiMaternityDress.createdAt,
    updatedAt: apiMaternityDress.updatedAt,
    createdBy: apiMaternityDress.createdBy,
    updatedBy: apiMaternityDress.updatedBy,
    globalStatus: apiMaternityDress.globalStatus || 'INACTIVE'
  }
}

export const transformMaternityDressListToMaternityDress = (apiMaternityDress: MaternityDressList): MaternityDress => {
  return {
    id: apiMaternityDress.id,
    styleName: apiMaternityDress.styleName,
    name: apiMaternityDress.name,
    sku: apiMaternityDress.sku || '',
    description: apiMaternityDress.description,
    images: apiMaternityDress.images || [],
    slug: apiMaternityDress.slug,
    price: apiMaternityDress.price,
    createdAt: apiMaternityDress.createdAt,
    updatedAt: apiMaternityDress.updatedAt,
    createdBy: apiMaternityDress.createdBy,
    updatedBy: apiMaternityDress.updatedBy,
    globalStatus: apiMaternityDress.globalStatus
  }
}

// Form data types (re-export from inventory.type.ts for convenience)
export type { MaternityDressFormData } from '@/@types/manage-maternity-dress.types'
