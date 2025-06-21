import { z } from 'zod'

// Category schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.array(z.string()).optional(),
  
})

// Style schema  
export const styleSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.array(z.string()).optional(),
  isCustom: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional()
})

// List schemas
export const categoryListSchema = z.array(categorySchema)
export const styleListSchema = z.array(styleSchema)

// Types
export type CategorySchema = z.infer<typeof categorySchema>
export type StyleSchema = z.infer<typeof styleSchema>

// Form data types
export type CategoryFormData = {
  name: string
  description?: string
  images?: string[]
}

export type StyleFormData = {
  categoryId: string
  name: string
  description?: string
  images?: string[]
  isCustom?: boolean
} 