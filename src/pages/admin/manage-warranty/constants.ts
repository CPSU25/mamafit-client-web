import { RequestType, StatusWarrantyRequest } from '@/@types/warranty-request.types'
import { Clock, CheckCircle, AlertTriangle, XCircle, Wrench, ShieldCheck, type LucideIcon } from 'lucide-react'

type StatusConfigEntry = { label: string; color: string; icon: LucideIcon }
type RequestTypeConfigEntry = { label: string; color: string }

export const statusConfig: Record<StatusWarrantyRequest, StatusConfigEntry> = {
  PENDING: {
    label: 'Chờ xử lý',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800',
    icon: Clock
  },
  APPROVED: {
    label: 'Đã duyệt',
    color:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800',
    icon: ShieldCheck
  },
  REPAIRING: {
    label: 'Đang sửa chữa',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800',
    icon: Wrench
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800',
    icon: CheckCircle
  },
  REJECTED: {
    label: 'Từ chối',
    color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800',
    icon: XCircle
  },
  PARTIALLY_REJECTED: {
    label: 'Từ chối một phần',
    color:
      'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-800',
    icon: AlertTriangle
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800',
    icon: XCircle
  }
}

export const requestTypeConfig: Record<RequestType, RequestTypeConfigEntry> = {
  FEE: {
    label: 'Sửa chữa, Có tính phí',
    color:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800'
  },
  FREE: {
    label: 'Bảo Hành',
    color:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800'
  }
}

// Tab to status mapping for filtering
export const tabStatusMapping: Record<string, StatusWarrantyRequest[]> = {
  all: [],
  pending: [StatusWarrantyRequest.PENDING],
  approved: [StatusWarrantyRequest.APPROVED],
  repairing: [StatusWarrantyRequest.REPAIRING],
  awaiting_payment: [StatusWarrantyRequest.APPROVED], // Chờ thanh toán = đã duyệt
  completed: [StatusWarrantyRequest.COMPLETED],
  rejected: [StatusWarrantyRequest.REJECTED, StatusWarrantyRequest.PARTIALLY_REJECTED]
}

// Tab labels for display
export const tabLabels: Record<string, string> = {
  all: 'Tất cả',
  pending: 'Chờ xử lý',
  approved: 'Đã duyệt',
  repairing: 'Sửa chữa',
  awaiting_payment: 'Chờ TT',
  completed: 'Hoàn thành',
  rejected: 'Từ chối'
}
