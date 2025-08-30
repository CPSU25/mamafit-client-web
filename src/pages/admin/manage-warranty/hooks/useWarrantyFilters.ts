import { useMemo } from 'react'
import { WarrantyRequestList, StatusWarrantyRequest } from '@/@types/warranty-request.types'

interface UseWarrantyFiltersProps {
  requests: WarrantyRequestList[]
  selectedTab: string
  searchQuery: string
  statusFilter?: string
}

export const useWarrantyFilters = ({ requests, selectedTab, searchQuery, statusFilter }: UseWarrantyFiltersProps) => {
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Tab filter mapping - maps tab values to actual status values
      const tabStatusMap: Record<string, StatusWarrantyRequest[]> = {
        all: [],
        pending: [StatusWarrantyRequest.PENDING],
        approved: [StatusWarrantyRequest.APPROVED],
        repairing: [StatusWarrantyRequest.REPAIRING],
        awaiting_payment: [StatusWarrantyRequest.APPROVED], // Chờ thanh toán = đã duyệt
        completed: [StatusWarrantyRequest.COMPLETED],
        rejected: [StatusWarrantyRequest.REJECTED, StatusWarrantyRequest.PARTIALLY_REJECTED]
      }

      // Apply tab filter
      if (selectedTab !== 'all') {
        const allowedStatuses = tabStatusMap[selectedTab] || []
        if (allowedStatuses.length > 0 && !allowedStatuses.includes(request.status)) {
          return false
        }
      }

      // Status filter mapping (for additional status filtering if needed)
      if (statusFilter && statusFilter !== 'all') {
        const statusMap: Record<string, StatusWarrantyRequest[]> = {
          pending: [StatusWarrantyRequest.PENDING],
          approved: [StatusWarrantyRequest.APPROVED],
          repairing: [StatusWarrantyRequest.REPAIRING],
          completed: [StatusWarrantyRequest.COMPLETED],
          partially_rejected: [StatusWarrantyRequest.PARTIALLY_REJECTED],
          fully_rejected: [StatusWarrantyRequest.REJECTED]
        }

        const allowedStatuses = statusMap[statusFilter] || []
        if (allowedStatuses.length > 0 && !allowedStatuses.includes(request.status)) {
          return false
        }
      }

      // Search filter - search across multiple fields
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const searchFields = [
          request.sku?.toLowerCase() || '',
          request.customer.fullName?.toLowerCase() || '',
          request.customer.phoneNumber?.toLowerCase() || '',
          request.customer.userEmail?.toLowerCase() || ''
        ]

        if (!searchFields.some((field) => field.includes(query))) {
          return false
        }
      }

      return true
    })
  }, [requests, selectedTab, searchQuery, statusFilter])

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    return {
      total: filteredRequests.length,
      pending: filteredRequests.filter((r) => r.status === StatusWarrantyRequest.PENDING).length,
      approved: filteredRequests.filter((r) => r.status === StatusWarrantyRequest.APPROVED).length,
      repairing: filteredRequests.filter((r) => r.status === StatusWarrantyRequest.REPAIRING).length,
      completed: filteredRequests.filter((r) => r.status === StatusWarrantyRequest.COMPLETED).length,
      rejected: filteredRequests.filter(
        (r) => r.status === StatusWarrantyRequest.REJECTED || r.status === StatusWarrantyRequest.PARTIALLY_REJECTED
      ).length
    }
  }, [filteredRequests])

  return {
    filteredRequests,
    filteredStats,
    hasResults: filteredRequests.length > 0,
    totalResults: filteredRequests.length
  }
}
