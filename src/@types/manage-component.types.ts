export interface ComponentType {
  id: string
  name: string
  description: string
  images: Array<string>
  globalStatus: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface ComponentByIdType extends ComponentType {
  options: Array<ComponentOptionType>
}

export interface ComponentOptionType {
  id: string
  name: string
  description: string
  componentId: string
  componentName: string
  images: Array<string>
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface ComponentOptionFormData {
  componentId: string
  name: string
  description: string
  images: Array<string>
}

export interface ComponentTypeFormData {
  name: string
  description: string
  images: Array<string>
}
