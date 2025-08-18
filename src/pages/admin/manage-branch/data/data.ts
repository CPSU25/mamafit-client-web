import { Building, MapPin, CheckCircle, XCircle } from 'lucide-react'

export const branchTypes = [
  {
    label: 'Chi nhánh chính',
    value: 'main',
    icon: Building
  },
  {
    label: 'Chi nhánh phụ',
    value: 'sub',
    icon: MapPin
  }
] as const

export const branchStatusTypes = [
  {
    label: 'Hoạt động',
    value: 'active',
    icon: CheckCircle
  },
  {
    label: 'Ngừng hoạt động',
    value: 'inactive',
    icon: XCircle
  }
] as const

export const callTypes = new Map([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300']
])
