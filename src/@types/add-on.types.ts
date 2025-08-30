export enum ItemServiceType {
  IMAGE = 'IMAGE',
  PATTERN = 'PATTERN',
  TEXT = 'TEXT'
}

export interface AddOnList {
  id: string
  name: string
  description: string
  addOnOptions: AddOnOptionList[]
}

export interface AddOnOptionList {
  id: string
  addOnId: string
  name: string
  description: string
  price: number
  itemServiceType: ItemServiceType
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  position: Position
  size: Size
}

export interface Position {
  id: string
  name: string
  image: string | null
}

export interface Size {
  id: string
  name: string
}

export interface AddOnForm {
  name: string
  description: string
}

export interface AddOnOptionForm {
  addOnId: string
  name: string
  description: string
  price: number
  itemServiceType: ItemServiceType
  positionId: string
  sizeId: string
}

export interface PositionForm {
  name: string
  image: string | null
}

export interface SizeForm {
  name: string
}
