// Page size options
export const pageSizeOptions = [
  { value: '5', label: '5 / trang' },
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' }
]

// Item service type options
export const itemServiceTypeOptions = [
  { value: 'IMAGE', label: 'Hình ảnh' },
  { value: 'PATTERN', label: 'Mẫu' },
  { value: 'TEXT', label: 'Văn bản' }
]

// Sort options for add-ons
export const sortOptions = [
  { value: 'CREATED_AT_DESC', label: 'Mới nhất' },
  { value: 'CREATED_AT_ASC', label: 'Cũ nhất' },
  { value: 'NAME_ASC', label: 'Tên A-Z' },
  { value: 'NAME_DESC', label: 'Tên Z-A' },
  { value: 'PRICE_ASC', label: 'Giá tăng dần' },
  { value: 'PRICE_DESC', label: 'Giá giảm dần' }
]

// Tab options
export const addOnTabs = [
  { value: 'add-ons', label: 'Add-ons' },
  { value: 'positions', label: 'Positions' },
  { value: 'sizes', label: 'Sizes' }
] as const

export type AddOnTabType = (typeof addOnTabs)[number]['value']
