import { RequestType, StatusWarrantyRequest } from '@/@types/warranty-request.types'
import { Clock, CheckCircle, AlertTriangle, XCircle, Wrench, ShieldCheck, type LucideIcon } from 'lucide-react'

type StatusConfigEntry = { label: string; color: string; icon: LucideIcon }
type RequestTypeConfigEntry = { label: string; color: string }

export const statusConfig: Record<StatusWarrantyRequest, StatusConfigEntry> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Clock
  },
  APPROVED: {
    label: 'Đã duyệt',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: ShieldCheck
  },
  REPAIRING: {
    label: 'Đang sửa chữa',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: Wrench
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  },
  PARTIALLY_REJECTED: {
    label: 'Từ chối một phần',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle
  }
}

export const requestTypeConfig: Record<RequestType, RequestTypeConfigEntry> = {
  FEE: {
    label: 'Sửa chữa, Có tính phí',
    color: 'bg-violet-100 text-violet-800 border-violet-200'
  },
  FREE: {
    label: 'Bảo Hành',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  }
}
