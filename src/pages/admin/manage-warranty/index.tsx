import { useState } from 'react';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  WarrantyFilters,
  WarrantyRequestCard,
  WarrantyRequestDetail,
  RejectItemDialog
} from './components';
import { mockWarrantyRequests } from './data/mockData';
import { WarrantyRequest, WarrantyItem } from './types';
import { useWarrantyFilters } from './hooks/useWarrantyFilters';



function WarrantyManagementSystem() {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<WarrantyRequest | null>(null);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<WarrantyItem | null>(null);

  // Filter requests based on tab, search and status
  const { filteredRequests } = useWarrantyFilters({
    requests: mockWarrantyRequests,
    selectedTab,
    searchQuery,
    statusFilter
  });

  const handleRejectItem = (itemId: string, reason: string) => {
    console.log('Rejecting item:', itemId, 'Reason:', reason);
      // API call to update item status with rejection reason
    };



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý bảo hành
              </h1>
              <p className="text-gray-600 mt-2">
                Xử lý và theo dõi các yêu cầu bảo hành từ khách hàng
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-violet-100 text-violet-800 border-violet-200">
                <Shield className="w-4 h-4 mr-1" />
                {filteredRequests.length} yêu cầu
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <WarrantyFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="in_transit">Vận chuyển</TabsTrigger>
            <TabsTrigger value="repairing">Sửa chữa</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
            <TabsTrigger value="rejected">Từ chối</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Warranty Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <WarrantyRequestCard 
              key={request.id} 
              request={request} 
              onViewDetail={setSelectedRequest}
            />
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có yêu cầu bảo hành nào
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Thử thay đổi bộ lọc để xem thêm yêu cầu'
                : 'Chưa có yêu cầu bảo hành nào được tạo'
              }
            </p>
          </div>
        )}
      </div>

      {/* Warranty Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          {selectedRequest && (
            <WarrantyRequestDetail 
              request={selectedRequest} 
              onClose={() => setSelectedRequest(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Item Dialog */}
      <Dialog open={!!selectedItemForEdit} onOpenChange={() => setSelectedItemForEdit(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItemForEdit && (
            <RejectItemDialog
              item={selectedItemForEdit}
              onClose={() => setSelectedItemForEdit(null)}
              onReject={handleRejectItem}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WarrantyManagementSystem;