import { z } from 'zod'
import { AddOnList, AddOnOptionList, Position, Size } from '@/@types/add-on.types'

// Add-on schema
const addOnSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  addOnOptions: z.array(z.any()).optional()
})

export type AddOn = z.infer<typeof addOnSchema>

// Add-on Option schema
const addOnOptionSchema = z.object({
  id: z.string(),
  addOnId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  itemServiceType: z.enum(['IMAGE', 'PATTERN', 'TEXT']),
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  position: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable()
    })
    .nullable(),
  size: z
    .object({
      id: z.string(),
      name: z.string()
    })
    .nullable()
})

export type AddOnOption = z.infer<typeof addOnOptionSchema>

// Position schema
const positionSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable()
})

export type PositionSchema = z.infer<typeof positionSchema>

// Size schema
const sizeSchema = z.object({
  id: z.string(),
  name: z.string()
})

export type SizeSchema = z.infer<typeof sizeSchema>

// List schemas
export const addOnListSchema = z.array(addOnSchema)
export const addOnOptionListSchema = z.array(addOnOptionSchema)
export const positionListSchema = z.array(positionSchema)
export const sizeListSchema = z.array(sizeSchema)

// Transform functions
export const transformAddOnListToSchema = (apiAddOn: AddOnList): AddOn => {
  return {
    id: apiAddOn.id,
    name: apiAddOn.name,
    description: apiAddOn.description,
    addOnOptions: apiAddOn.addOnOptions || []
  }
}

export const transformAddOnOptionListToSchema = (apiAddOnOption: AddOnOptionList): AddOnOption => {
  return {
    id: apiAddOnOption.id,
    addOnId: apiAddOnOption.addOnId,
    name: apiAddOnOption.name,
    description: apiAddOnOption.description,
    price: apiAddOnOption.price,
    itemServiceType: apiAddOnOption.itemServiceType,
    createdBy: apiAddOnOption.createdBy,
    updatedBy: apiAddOnOption.updatedBy,
    createdAt: apiAddOnOption.createdAt,
    updatedAt: apiAddOnOption.updatedAt,
    position: apiAddOnOption.position,
    size: apiAddOnOption.size
  }
}

export const transformPositionToSchema = (apiPosition: Position): PositionSchema => {
  return {
    id: apiPosition.id,
    name: apiPosition.name,
    image: apiPosition.image
  }
}

export const transformSizeToSchema = (apiSize: Size): SizeSchema => {
  return {
    id: apiSize.id,
    name: apiSize.name
  }
}
