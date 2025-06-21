import { z } from 'zod'
import { CategoryType } from '@/@types/inventory.type'

// Status schema cho category
const categoryStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type CategoryStatus = z.infer<typeof categoryStatusSchema>

// Category schema dựa trên CategoryType từ API
const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  // Derived fields for compatibility
  status: categoryStatusSchema.optional()
})

export type Category = z.infer<typeof categorySchema>

export const categoryListSchema = z.array(categorySchema)

// Helper function to transform CategoryType từ API sang Category format cho component
export const transformCategoryTypeToCategory = (apiCategory: CategoryType): Category => {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    description: apiCategory.description || '',
    images: apiCategory.images || [],
    createdAt: apiCategory.createdAt,
    updatedAt: apiCategory.updatedAt,
    // Default status là active
    status: 'active' as CategoryStatus
  }
}

// Style schema
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

// List schemas
export const styleListSchema = z.array(styleSchema)

// Types
export type StyleSchema = z.infer<typeof styleSchema>

// Form data types (re-export from inventory.type.ts for convenience)
export type { CategoryFormData, StyleFormData } from '@/@types/inventory.type'
