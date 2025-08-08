import { Eye, MoreVertical, Edit, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StatusBadge } from './StatusBadge';
import { RequestTypeBadge } from './RequestTypeBadge';
import { WarrantyRequestCardProps } from '../types';

export const WarrantyRequestCard = ({ request, onViewDetail }: WarrantyRequestCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold text-violet-900">
            {request.sku}
          </CardTitle>
          <CardDescription className="mt-1">
            Khách hàng: {request.customer.name} • {request.customer.phone}
          </CardDescription>
        </div>
        <div className="flex gap-2 flex-col items-end">
          <StatusBadge status={request.status} />
          <RequestTypeBadge type={request.requestType} />
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Số lượng item:</span>
          <span className="font-medium">{request.items.length} sản phẩm</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tổng phí:</span>
          <span className="font-medium text-violet-900">
            {request.totalFee?.toLocaleString('vi-VN')}₫
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Ngày tạo:</span>
          <span className="font-medium">
            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetail(request)}
            className="text-violet-700 border-violet-200 hover:bg-violet-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem chi tiết
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetail(request)}>
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="w-4 h-4 mr-2" />
                Ghi chú
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>
);
