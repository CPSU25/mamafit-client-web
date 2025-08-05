import { api } from '@/lib/axios/axios'
import { ItemBaseResponse, ListBaseResponse } from '@/@types/response'
import { DressTemplate, ComponentOption } from '@/@types/designer.types'

// API Response interfaces based on actual API structure
interface PresetListItem {
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
}

interface PresetDetailResponse {
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

interface SendPresetToDesignRequestResponse {
  success: boolean
  message: string
  data?: {
    presetId: string
    designRequestId: string
    orderId: string
  }
}

export interface PresetListParams {
  index?: number
  pageSize?: number
}

// API functions
export const presetApi = {
  // Get list of presets with pagination
  getPresets: async (params?: PresetListParams): Promise<ListBaseResponse<PresetListItem>> => {
    const response = await api.get('/preset', {
      params: {
        index: params?.index || 1,
        pageSize: params?.pageSize || 10
      }
    })
    return response.data
  },

  // Get preset detail by ID
  getPresetById: async (id: string): Promise<ItemBaseResponse<PresetDetailResponse>> => {
    const response = await api.get(`/preset/${id}`)
    return response.data
  },

  // Create new preset
  createPreset: async (data: Partial<DressTemplate>): Promise<ItemBaseResponse<DressTemplate>> => {
    const response = await api.post('/preset', data)
    return response.data
  },

  // Update preset
  updatePreset: async (id: string, data: Partial<DressTemplate>): Promise<ItemBaseResponse<DressTemplate>> => {
    const response = await api.put(`/preset/${id}`, data)
    return response.data
  },

  // Delete preset
  deletePreset: async (id: string): Promise<void> => {
    await api.delete(`/preset/${id}`)
  },

  // Send preset to design request
  sendPresetToDesignRequest: async (data: {
    images: string[]
    type: 'USER'
    isDefault: boolean
    price: number
    designRequestId: string
    orderId: string
  }): Promise<ItemBaseResponse<SendPresetToDesignRequestResponse>> => {
    const response = await api.post('/preset/design-request', data)
    return response.data
  }
}

// Transform functions to convert API data to our internal types
export const transformPresetListItem = (item: PresetListItem): DressTemplate => ({
  id: item.id,
  styleId: item.styleId,
  styleName: item.styleName,
  createdAt: item.createdAt,
  createdBy: item.createdBy,
  updatedAt: item.updatedAt,
  updatedBy: item.updatedBy,
  images: item.images,
  type: item.type,
  isDefault: item.isDefault,
  price: item.price
})

export const transformPresetDetail = (item: PresetDetailResponse): DressTemplate => ({
  id: item.id,
  styleId: item.styleId,
  styleName: item.styleName,
  createdAt: item.createdAt,
  createdBy: item.createdBy,
  updatedAt: item.updatedAt,
  updatedBy: item.updatedBy,
  images: item.images,
  type: item.type,
  isDefault: item.isDefault,
  price: item.price,
  componentOptions: item.componentOptions
})
