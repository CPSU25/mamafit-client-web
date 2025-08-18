export interface CategoryType {
  id: string
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  images?: Array<string>
  createdAt?: Date | string
  updatedAt?: Date | string
}
export interface CategoryFormData {
  name: string
  description: string
  images?: string[]
}
export interface StyleType {
  id: string
  name: string
  description?: string
  images?: string[]
  isCustom?: boolean
  createdBy?: string
  updatedBy?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface StyleFormData {
  categoryId: string
  name: string
  isCustom?: boolean
  description?: string
  images?: string[]
}
export interface MaternityDressDetailType {
  id: string
  name: string
  sku: string
  description: string
  image: string[]
  color: string
  size: string
  quantity: number
  price: number
}
export enum GlobalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
export interface MaternityDressType {
  id: string
  styleName: string
  name: string
  sku: string | null
  description: string
  images: Array<string>
  slug: string
  price: number
  globalStatus: GlobalStatus
  createdAt: Date | string
  updatedAt: Date | string
  createdBy: string
  updatedBy: string | null
  details: MaternityDressDetailType[]
}
export type MaternityDressList = Pick<
  MaternityDressType,
  | 'id'
  | 'styleName'
  | 'name'
  | 'description'
  | 'images'
  | 'slug'
  | 'price'
  | 'sku'
  | 'globalStatus'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>
export type MaternityDressDetail = Pick<
  MaternityDressType,
  | 'id'
  | 'styleName'
  | 'name'
  | 'sku'
  | 'description'
  | 'images'
  | 'slug'
  | 'price'
  | 'details'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
>

export interface MaternityDressFormData {
  styleId: string
  name: string
  description: string
  images: string[]
  slug: string
}

export interface MaternityDressDetailFormData {
  maternityDressId: string
  name: string
  description: string
  image: string[]
  color: string
  size: string
  price: number
  quantity: number
}
