import { z } from 'zod'
import { ComponentByIdType, ComponentOptionType, ComponentType } from '@/@types/manage-component.types'

const componentStatusSchema = z.union([z.literal('ACTIVE'), z.literal('INACTIVE')])
export type ComponentStatus = z.infer<typeof componentStatusSchema>

const componentOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  componentId: z.string(),
  componentName: z.string(),
  images: z.array(z.string()),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()])
})

export type ComponentOption = z.infer<typeof componentOptionSchema>

const componentSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  images: z.array(z.string()),
  globalStatus: componentStatusSchema,
  options: z.array(componentOptionSchema).optional(), // Optional for list view
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string(),
  updatedBy: z.string()
})

export type Component = z.infer<typeof componentSchema>

export const componentListSchema = z.array(componentSchema)

// For list view (ComponentType without options)
export const transformComponentListToComponent = (apiComponent: ComponentType): Component => {
  return {
    id: apiComponent.id,
    name: apiComponent.name,
    description: apiComponent.description,
    images: apiComponent.images || [],
    globalStatus: apiComponent.globalStatus as ComponentStatus,
    options: [], // Empty for list view
    createdAt: apiComponent.createdAt,
    updatedAt: apiComponent.updatedAt,
    createdBy: apiComponent.createdBy,
    updatedBy: apiComponent.updatedBy
  }
}

// For detail view (ComponentByIdType with options)
export const transformComponentTypeToComponent = (apiComponent: ComponentByIdType): Component => {
  return {
    id: apiComponent.id,
    name: apiComponent.name,
    description: apiComponent.description,
    images: apiComponent.images || [],
    globalStatus: apiComponent.globalStatus as ComponentStatus,
    options: (apiComponent.options || []).map((option: ComponentOptionType) => ({
      id: option.id,
      name: option.name,
      description: option.description,
      componentId: option.componentId,
      componentName: option.componentName,
      images: option.images || [],
      createdBy: option.createdBy,
      updatedBy: option.updatedBy,
      createdAt: option.createdAt,
      updatedAt: option.updatedAt
    })),
    createdAt: apiComponent.createdAt,
    updatedAt: apiComponent.updatedAt,
    createdBy: apiComponent.createdBy,
    updatedBy: apiComponent.updatedBy
  }
}

// Form data types (re-export from admin.types.ts for convenience)
export type { ComponentTypeFormData, ComponentOptionFormData } from '@/@types/manage-component.types'
