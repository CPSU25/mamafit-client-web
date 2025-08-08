import { useMemo } from 'react';
import { WarrantyRequest } from '../types';

interface UseWarrantyFiltersProps {
  requests: WarrantyRequest[];
  selectedTab: string;
  searchQuery: string;
  statusFilter: string;
}

export const useWarrantyFilters = ({
  requests,
  selectedTab,
  searchQuery,
  statusFilter
}: UseWarrantyFiltersProps) => {
  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Tab filter
      if (selectedTab !== 'all' && request.status !== selectedTab.toUpperCase()) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && request.status !== statusFilter.toUpperCase()) {
        return false;
      }
      
      // Search filter
      if (searchQuery && 
          !request.sku.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !request.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [requests, selectedTab, searchQuery, statusFilter]);

  return { filteredRequests };
};
