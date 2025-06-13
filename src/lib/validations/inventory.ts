import { z } from 'zod'

// Step 1: Maternity Dress validation schema
export const maternityDressSchema = z.object({
  styleId: z
    .string()
    .min(1, 'Style is required'),
  
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters'),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  
  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
    .max(9999.99, 'Price is too high'),
  
  images: z
    .array(z.string().min(1, 'Image URL cannot be empty'))
    .min(1, 'At least one image is required')
    .max(10, 'Cannot have more than 10 images'),
  
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug must not exceed 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
})

// Step 2: Maternity Dress Variant validation schema
export const maternityDressVariantSchema = z.object({
  maternityDressId: z
    .string()
    .min(1, 'Maternity dress ID is required'),
  
  name: z
    .string()
    .min(3, 'Variant name must be at least 3 characters')
    .max(100, 'Variant name must not exceed 100 characters'),
  
  description: z
    .string()
    .min(5, 'Description must be at least 5 characters')
    .max(200, 'Description must not exceed 200 characters'),
  
  color: z
    .string()
    .min(1, 'Color is required')
    .max(50, 'Color must not exceed 50 characters'),
  
  image: z
    .string()
    .min(1, 'Image is required'),
  
  size: z
    .string()
    .min(1, 'Size is required'),
  
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative')
    .max(9999, 'Quantity is too high'),
})

// Product form validation schema
export const inventoryProductSchema = z.object({
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(20, 'SKU must not exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'SKU must contain only uppercase letters, numbers, and hyphens'),
  
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters'),
  
  image: z.string().optional(),
  
  category: z
    .string()
    .min(1, 'Category is required'),
  
  style: z
    .string()
    .min(1, 'Style is required'),
  
  size: z
    .string()
    .min(1, 'Size is required'),
  
  stockQuantity: z
    .number()
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock quantity cannot be negative'),
  
  sellingPrice: z
    .number()
    .min(0.01, 'Selling price must be greater than 0')
    .max(9999.99, 'Selling price is too high'),
  
  costPrice: z
    .number()
    .min(0, 'Cost price cannot be negative')
    .max(9999.99, 'Cost price is too high'),
  
  status: z.enum(['Active', 'Out-of-stock', 'Upcoming', 'Discontinued', 'Incomplete', 'Draft'], {
    required_error: 'Status is required',
  }),
  
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty'))
    .min(1, 'At least one tag is required')
    .max(10, 'Cannot have more than 10 tags'),
  
  pregnancyStage: z
    .enum(['First Trimester', 'Second Trimester', 'Third Trimester', 'Postpartum'])
    .optional(),
  
  material: z
    .string()
    .max(50, 'Material must not exceed 50 characters')
    .optional(),
  
  occasion: z
    .string()
    .max(50, 'Occasion must not exceed 50 characters')
    .optional(),
  
  linkedTemplate: z
    .string()
    .optional(),
})

// Custom validation for cost vs selling price
export const inventoryProductWithPriceValidation = inventoryProductSchema.refine(
  (data) => data.sellingPrice > data.costPrice,
  {
    message: 'Selling price must be greater than cost price',
    path: ['sellingPrice'],
  }
)

// Filters validation schema
export const inventoryFiltersSchema = z.object({
  category: z.string().optional(),
  style: z.string().optional(),
  size: z.string().optional(),
  status: z.enum(['Active', 'Out-of-stock', 'Upcoming', 'Discontinued', 'Incomplete', 'Draft']).optional(),
  pregnancyStage: z.enum(['First Trimester', 'Second Trimester', 'Third Trimester', 'Postpartum']).optional(),
  material: z.string().optional(),
  occasion: z.string().optional(),
  search: z.string().optional(),
})

// Bulk action validation schema
export const bulkActionSchema = z.object({
  type: z.enum(['delete', 'status-update', 'export']),
  productIds: z.array(z.string()).min(1, 'At least one product must be selected'),
  newStatus: z.enum(['Active', 'Out-of-stock', 'Upcoming', 'Discontinued', 'Incomplete', 'Draft']).optional(),
})

// Type exports
export type MaternityDressForm = z.infer<typeof maternityDressSchema>
export type MaternityDressVariantForm = z.infer<typeof maternityDressVariantSchema>
export type InventoryProductForm = z.infer<typeof inventoryProductSchema>
export type InventoryFiltersForm = z.infer<typeof inventoryFiltersSchema>
export type BulkActionForm = z.infer<typeof bulkActionSchema> 