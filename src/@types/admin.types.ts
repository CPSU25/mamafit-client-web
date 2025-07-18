export interface Category {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Style {
  id: string
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export interface CategoryFormData {
  name: string
}

export interface StyleFormData {
  name: string
}

export interface MaternityDress {
  id: string
  styleId: string
  name: string
  description: string
  price: number
  images: string[]
  slug: string
  status: 'Draft' | 'Incomplete' | 'Complete'
  createdAt: Date
  updatedAt?: Date
}

export interface MaternityDressVariant {
  id: string
  maternityDressId: string
  name: string
  description: string
  color: string
  image: string
  size: string
  quantity: number
  createdAt: Date
  updatedAt?: Date
}

export interface MaternityDressVariantFormData {
  maternityDressId: string
  name: string
  description: string
  color: string
  image: string
  size: string
  quantity: number
}

export interface InventoryProduct {
  id: string
  sku: string
  name: string
  image?: string
  category: string
  style: string
  size: string
  stockQuantity: number
  sellingPrice: number
  costPrice: number
  status: 'Active' | 'Out-of-stock' | 'Upcoming' | 'Discontinued' | 'Incomplete' | 'Draft'
  tags: string[]
  pregnancyStage?: 'First Trimester' | 'Second Trimester' | 'Third Trimester' | 'Postpartum'
  material?: string
  occasion?: string
  linkedTemplate?: string
  createdAt: Date
  updatedAt?: Date
  // New fields to link with dress creation
  maternityDressId?: string
  variantId?: string
  color?: string
  isComplete?: boolean
  variants?: MaternityDressVariant[]
  // New field for expandable row
  isExpanded?: boolean
}

export interface InventoryProductFormData {
  sku: string
  name: string
  image?: string
  category: string
  style: string
  size: string
  stockQuantity: number
  sellingPrice: number
  costPrice: number
  status: 'Active' | 'Out-of-stock' | 'Upcoming' | 'Discontinued' | 'Incomplete' | 'Draft'
  tags: string[]
  pregnancyStage?: 'First Trimester' | 'Second Trimester' | 'Third Trimester' | 'Postpartum'
  material?: string
  occasion?: string
  linkedTemplate?: string
}

// Expandable Product Detail State
export interface ExpandedProductState {
  productId: string | null
  maternityDress?: MaternityDress
  variants: MaternityDressVariant[]
  isLoading: boolean
  error?: string
  activeTab: 'info' | 'variants' | 'inventory'
}

export interface MaternityDressFilters {
  pageSize?: number
  index?: number
  sortBy?: string
  search?: string
}

export interface BulkAction {
  type: 'delete' | 'status-update' | 'export'
  productIds: string[]
  newStatus?: 'Active' | 'Out-of-stock' | 'Upcoming' | 'Discontinued' | 'Incomplete' | 'Draft'
}

// Manage User Type
export type ManageUserType = {
  id: string
  userName: string
  userEmail: string
  dateOfBirth: string
  profilePicture: string
  phoneNumber: string
  roleName: string
  fullName: string
  createdAt: string
  updatedAt: string
  isVerify: boolean
}
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
  price: number
  tag: {
    parentTag: Array<string>
    childTag: Array<string>
  } | null
  images: Array<string>
  componentOptionType: 'APPROVED' | 'PENDING' | 'REJECTED' | 'QUOTATION_PENDING'
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface ComponentOptionFormData {
  componentId: string
  name: string
  description: string
  price: number
  tag: {
    parentTag: Array<string>
    childTag: Array<string>
  }
  images: Array<string>
  componentOptionType: 'APPROVED' | 'PENDING' | 'REJECTED' | 'QUOTATION_PENDING'
}

export interface ComponentTypeFormData {
  name: string
  description: string
  images: Array<string>
}
