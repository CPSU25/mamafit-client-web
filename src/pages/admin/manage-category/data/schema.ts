import { z } from 'zod'
import { CategoryType } from '@/@types/manage-maternity-dress.types'

const categoryStatusSchema = z.union([z.literal('ACTIVE'), z.literal('INACTIVE')])
export type CategoryStatus = z.infer<typeof categoryStatusSchema>

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  status: categoryStatusSchema
})

export type Category = z.infer<typeof categorySchema>

export const categoryListSchema = z.array(categorySchema)

export const transformCategoryTypeToCategory = (apiCategory: CategoryType): Category => {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description || '',
    images: apiCategory.images || [],
    createdAt: apiCategory.createdAt,
    updatedAt: apiCategory.updatedAt,
    status: apiCategory.status as CategoryStatus
  }
}

export const styleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  isCustom: z.boolean().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional()
})

export const styleListSchema = z.array(styleSchema)

export type StyleSchema = z.infer<typeof styleSchema>

// Form data types (re-export from inventory.type.ts for convenience)
export type { CategoryFormData, StyleFormData } from '@/@types/manage-maternity-dress.types'
