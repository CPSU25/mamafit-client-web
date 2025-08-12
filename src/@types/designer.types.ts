//Manage Preset

export interface PresetType {
  name: string | null
  id: string
  styleName: string
  styleId: string
  images: string[]
  isDefault: boolean
  price: number
  type: string
  createdAt: string
  createdBy: string
  updatedAt: string
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

// Designer-specific types for dress template management

export interface ComponentOption {
  id: string
  name: string
  description: string
  componentId: string
  componentName: string
  price: number
  tag: string | null
  images: string[]
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface DressTemplate {
  id: string
  styleId: string
  styleName: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  images: string[]
  type: 'SYSTEM' | 'USER'
  isDefault: boolean
  price: number
  componentOptions?: ComponentOption[] // Available when fetching by ID
}

export interface DressStyle {
  styleId: string
  styleName: string
  templates: DressTemplate[]
  totalTemplates: number
}

// API Response types
export interface DressTemplateResponse {
  id: string
  styleId: string
  styleName: string
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  images: string[]
  type: 'SYSTEM' | 'USER'
  isDefault: boolean
  price: number
  componentOptions: ComponentOption[]
}

export interface TemplateListResponse {
  items: DressTemplate[]
  total: number
  page: number
  pageSize: number
}

// UI State types
export type ViewMode = 'grid' | 'list'
export type SortBy = 'CREATED_AT_DESC' | 'UPDATED_AT_DESC' | 'PRICE_DESC' | 'STYLE_NAME_DESC'
export type FilterBy = 'all' | 'SYSTEM' | 'USER' | 'default' | 'hasOptions'

export interface TemplateFilters {
  search: string
  sortBy: SortBy
  filterBy: FilterBy
  styleId?: string
}

export interface TemplateStats {
  styles: number
  templates: number
  componentOptions: number
  totalPrice: number
}
