import { Package, AlertCircle } from 'lucide-react'

// Sort options for categories
export const sortOptions = [
  { value: 'createdat_desc', label: 'Mới nhất' },
  { value: 'createdat_asc', label: 'Cũ nhất' },
  { value: 'name_asc', label: 'Tên A-Z' },
  { value: 'name_desc', label: 'Tên Z-A' }
]

// Page size options
export const pageSizeOptions = [
  { value: '5', label: '5 / trang' },
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' }
]

// Category status types
export const categoryTypes = [
  {
    value: 'active',
    label: 'Active',
    icon: Package
  },
  {
    value: 'inactive', 
    label: 'Inactive',
    icon: AlertCircle
  }
]

// Status color mapping
export const statusTypes = new Map([
  ['active', 'text-green-600 bg-green-50 border-green-200'],
  ['inactive', 'text-red-600 bg-red-50 border-red-200']
]) 