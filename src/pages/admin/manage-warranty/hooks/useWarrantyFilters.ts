import { useMemo } from 'react'
import { WarrantyRequestList } from '@/@types/warranty-request.types'

interface UseWarrantyFiltersProps {
  requests: WarrantyRequestList[]
  selectedTab: string
  searchQuery: string
  statusFilter: string
}

export const useWarrantyFilters = ({ requests, selectedTab, searchQuery, statusFilter }: UseWarrantyFiltersProps) => {
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Tab filter mapping
      const tabStatusMap: Record<string, string[]> = {
        all: [],
        pending: ['PENDING'],
        in_transit: ['IN_TRANSIT'],
        repairing: ['REPAIRING'],
        completed: ['COMPLETED'],
        rejected: ['REJECTED', 'PARTIALLY_REJECTED']
      }

      // Apply tab filter
      if (selectedTab !== 'all') {
        const allowedStatuses = tabStatusMap[selectedTab] || []
        if (allowedStatuses.length > 0 && !allowedStatuses.includes(request.status)) {
          return false
        }
      }

      // Status filter mapping
      const statusMap: Record<string, string[]> = {
        all: [],
        pending: ['PENDING'],
        in_transit: ['IN_TRANSIT'],
        repairing: ['REPAIRING'],
        completed: ['COMPLETED'],
        partially_rejected: ['PARTIALLY_REJECTED'],
        fully_rejected: ['REJECTED']
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        const allowedStatuses = statusMap[statusFilter] || []
        if (allowedStatuses.length > 0 && !allowedStatuses.includes(request.status)) {
          return false
        }
      }

      // Search filter
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

  return { filteredRequests }
}
