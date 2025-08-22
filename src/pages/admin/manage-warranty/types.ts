import { WarrantyRequestList } from '@/@types/warranty-request.types'

export type WarrantyRequestStatus =
  | 'PENDING'
  | 'IN_TRANSIT'
  | 'REPAIRING'
  | 'COMPLETED'
  | 'PARTIALLY_REJECTED'
  | 'FULLY_REJECTED'

export type WarrantyRequestType = 'REPAIR' | 'EXCHANGE' | 'REFUND'

export type WarrantyItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type DestinationType = 'FACTORY' | 'BRANCH'

export interface Customer {
  name: string
  phone: string
  email: string
}

export interface WarrantyItem {
  id: string
  orderItemId: string
  description: string
  images: string[]
  destinationType: DestinationType
  fee: number
  status: WarrantyItemStatus
  warrantyRound: number
  productName: string
  orderCode: string
  rejectedReason?: string
}

export interface WarrantyRequest {
  id: string
  sku: string
  requestType: WarrantyRequestType
  status: WarrantyRequestStatus
  totalFee: number
  createdAt: string
  customer: Customer
  items: WarrantyItem[]
  noteInternal?: string | null
  rejectedReason?: string | null
}

export interface StatusConfig {
  label: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}

export interface RequestTypeConfig {
  label: string
  color: string
}

export interface WarrantyRequestCardProps {
  request: WarrantyRequestList
  onViewDetail: (request: WarrantyRequestList) => void
}

export interface WarrantyRequestDetailProps {
  request: WarrantyRequestList
  onClose: () => void
}

export interface RejectItemDialogProps {
  item: WarrantyItem
  onClose: () => void
  onReject: (itemId: string, reason: string) => void
}

export interface StatusBadgeProps {
  status: WarrantyRequestStatus
}

export interface RequestTypeBadgeProps {
  type: WarrantyRequestType
}

export interface WarrantyFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}
