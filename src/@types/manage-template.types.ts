import { ComponentOptionType } from './manage-component.types'

export interface PresetListItem {
  id: string
  sku: string
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
}

export interface PresetDetailResponse {
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
  componentOptions: ComponentOptionType[]
}

export interface SendPresetToDesignRequestResponse {
  success: boolean
  message: string
  data?: {
    presetId: string
    designRequestId: string
    orderId: string
  }
}

export interface PresetFormData {
  sku: string
  styleId: string
  images: string[]
  type: 'SYSTEM'
  isDefault: boolean
  price: number
  componentOptionIds: string[]
}
