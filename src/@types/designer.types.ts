//Manage Preset

export interface PresetType {
  id: string
  styleName: string
  styleId: string
  images: string[]
  isDefault: boolean
  price: number
  type: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
export interface PresetFormData {
  styleName: string
  styleId: string
  images: string[]
  isDefault: boolean
  price: number
  designRequestId?: string
  componentOptionIds?: string[]
}
export interface ComponentOptionType {
  id: string
  name: string
  description: string
  componentId: string
  componentName: string
  price: number
  tag: string
  images: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface PresetByIdType extends PresetType {
  components: ComponentOptionType[]
}
