import { Building, MapPin, Clock } from 'lucide-react'

export const branchTypes = [
  {
    label: 'Main Branch',
    value: 'main',
    icon: Building
  },
  {
    label: 'Sub Branch',
    value: 'sub',
    icon: MapPin
  }
] as const

export const branchStatusTypes = [
  {
    label: 'Active',
    value: 'active',
    icon: Building
  },
  {
    label: 'Inactive',
    value: 'inactive',
    icon: Clock
  }
] as const

export const callTypes = new Map([
  ['active', 'text-green-600 bg-green-50 border-green-200'],
  ['inactive', 'text-red-600 bg-red-50 border-red-200']
])
