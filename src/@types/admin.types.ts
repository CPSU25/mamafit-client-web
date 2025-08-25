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
  sku: string | null
  name: string
  description: string
  price: number
  images: string[]
  slug: string
  globalStatus: 'ACTIVE' | 'INACTIVE'
  createdAt: Date
  updatedAt?: Date
}

export interface MaternityDressVariant {
  id: string
  maternityDressId: string
  sku: string
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
  userName: string | null
  userEmail: string
  dateOfBirth: string | null
  profilePicture: string | null
  phoneNumber: string
  roleName: string | null
  jobTitle: string | null
  fullName: string | null
  createdAt: string
  updatedAt: string
  isVerify: boolean
  createdBy?: string | null
  updatedBy?: string | null
}

//Milestone Type
export enum ApplyFor {
  READY_TO_BUY = 'READY_TO_BUY',
  PRESET = 'PRESET',
  DESIGN_REQUEST = 'DESIGN_REQUEST',
  WARRANTY = 'WARRANTY',
  ADD_ON = 'ADD_ON',
  QC_FAIL = 'QC_FAIL'
}
export interface MilestoneType {
  id: string
  name: string
  description: string
  applyFor: Array<ApplyFor>
  sequenceOrder: number
  createdAt: string
  updatedAt: string
  createdBy: string
}
export interface MilestoneByIdType extends MilestoneType {
  tasks: Array<TaskType>
}

export interface TaskType {
  id: string
  name: string
  description: string
  milestoneId: string
  sequenceOrder: number
  createdAt: string
  updatedAt: string
  createdBy: string
}
export interface MilestoneFormData {
  name: string
  description: string
  applyFor: Array<ApplyFor>
  sequenceOrder: number
}
export interface TaskFormData {
  name: string
  description: string
  milestoneId: string
  sequenceOrder: number
}

//Voucher Type
export interface VoucherBatchType {
  id: string
  batchName: string
  batchCode: string
  startDate: string
  endDate: string
  description: string
  totalQuantity: number
  discountType: string
  discountValue: number
  minimumOrderValue: string
  maximumDiscountValue: string
  isAutoGenerate: boolean
  remainingQuantity: number
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
export interface VoucherBatchFormData {
  batchName: string
  batchCode: string
  description: string
  startDate: string
  endDate: string
  totalQuantity: number
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  minimumOrderValue: number
  maximumDiscountValue: number
  isAutoGenerate: boolean
}
export interface VoucherDiscountType {
  id: string
  voucherBatchId: string
  code: string
  status: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface AssignVoucher {
  voucherBatchId: string
  userId: string
}
