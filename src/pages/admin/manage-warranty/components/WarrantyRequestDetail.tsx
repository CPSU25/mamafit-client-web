import { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, Factory, Store, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { StatusBadge } from './StatusBadge';
import { RequestTypeBadge } from './RequestTypeBadge';
import { WarrantyRequestDetailProps, WarrantyItemStatus, DestinationType } from '../types';
import { useWarrantyRequestById } from '@/services/global/warranty.service';

export const WarrantyRequestDetail = ({ request, onClose }: WarrantyRequestDetailProps) => {
  const { data: warrantyItem } = useWarrantyRequestById(request.id);
  const navigate = useNavigate();

  const [itemStatuses, setItemStatuses] = useState<Record<string, WarrantyItemStatus>>({});

  useEffect(() => {
    if (warrantyItem?.items && Array.isArray(warrantyItem.items)) {
      const initialStatuses = warrantyItem.items.reduce<Record<string, WarrantyItemStatus>>(
        (acc, item) => {
          const status = (item.status as unknown as WarrantyItemStatus) ?? 'PENDING';
          acc[item.orderItemId] = status;
          return acc;
        },
        {}
      );
      setItemStatuses(initialStatuses);
    }
  }, [warrantyItem]);

  const handleApproveItem = (itemId: string, destinationType: DestinationType) => {
    setItemStatuses(prev => ({ ...prev, [itemId]: 'APPROVED' }));
    // API call to update item status
    console.log(`Approved item ${itemId} for ${destinationType}`);
  };

  const getItemStatusColor = (status: WarrantyItemStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getItemStatusLabel = (status: WarrantyItemStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      default:
        return 'Chờ xử lý';
    }
  };

  return (
    <div className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader className="pb-4">
        <DialogTitle className="text-xl font-semibold text-violet-900">
          Chi tiết yêu cầu bảo hành {warrantyItem?.sku ?? request.sku}
        </DialogTitle>
        <DialogDescription>
          Đánh giá và xử lý yêu cầu bảo hành từ khách hàng
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Tên khách hàng</Label>
              <p className="mt-1 text-gray-900">{request.customer.fullName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Số điện thoại</Label>
              <p className="mt-1 text-gray-900">{request.customer.phoneNumber}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium text-gray-600">Email</Label>
              <p className="mt-1 text-gray-900">{warrantyItem?.customer.userEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* Request Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin yêu cầu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Loại yêu cầu</Label>
              <div className="mt-1">
                <RequestTypeBadge type={(warrantyItem ?? request).requestType} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Trạng thái</Label>
              <div className="mt-1">
                <StatusBadge status={(warrantyItem ?? request).status} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Tổng phí</Label>
              <p className="mt-1 text-lg font-semibold text-violet-900">
                {warrantyItem?.totalFee ? warrantyItem?.totalFee.toLocaleString('vi-VN') : 'Cần xác định'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Internal Notes */}
        {(warrantyItem?.noteInternal ?? request.noteInternal) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ghi chú nội bộ</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{warrantyItem?.noteInternal ? warrantyItem?.noteInternal : request.noteInternal}</p>
            </CardContent>
          </Card>
        )}

        {/* Warranty Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách sản phẩm cần bảo hành</CardTitle>
            <DialogDescription>
              Đánh giá từng sản phẩm và quyết định nơi xử lý bảo hành
            </DialogDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {warrantyItem?.items?.map((item) => (
              <div key={item.orderItemId} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {item.orderItemId}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Trạng thái: {item.status} • Lần bảo hành: {item.warrantyRound}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getItemStatusColor(itemStatuses[item.orderItemId] ?? 'PENDING')}
                  >
                    {getItemStatusLabel(itemStatuses[item.orderItemId] ?? 'PENDING')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Images */}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Hình ảnh</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {item.images?.map((image, imgIndex) => (
                        <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={image}
                            alt={`Hình ảnh ${imgIndex + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                            onClick={() => {
                              // Open image in full view
                              window.open(image, '_blank');
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description and Actions */}
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Mô tả vấn đề</Label>
                      <p className="mt-1 text-gray-900 text-sm">{item.description}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phí bảo hành</Label>
                      <p className="mt-1 text-gray-900 font-semibold">
                        {item.fee?.toLocaleString('vi-VN')}₫
                      </p>
                    </div>

                    {itemStatuses[item.orderItemId] === 'PENDING' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Chọn nơi xử lý</Label>
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveItem(item.orderItemId, 'FACTORY')}
                              className="text-orange-700 border-orange-200 hover:bg-orange-50"
                            >
                              <Factory className="w-4 h-4 mr-1" />
                              Nhà xưởng
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveItem(item.orderItemId, 'BRANCH')}
                              className="text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              <Store className="w-4 h-4 mr-1" />
                              Chi nhánh
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {itemStatuses[item.orderItemId] === 'APPROVED' && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center text-green-800">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Đã chấp nhận bảo hành</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Sẽ được xử lý tại: {item.destinationType === 'FACTORY' ? 'Nhà xưởng' : 'Chi nhánh'}
                        </p>
                      </div>
                    )}

                    {itemStatuses[item.orderItemId] === 'REJECTED' && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="flex items-center text-red-800">
                          <XCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Đã từ chối bảo hành</span>
                        </div>
                        {item.rejectedReason && (
                          <p className="text-sm text-red-700 mt-1">
                            Lý do: {item.rejectedReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {/* Original Order Info */}
                {Array.isArray(item.orders) && item.orders.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <Label className="text-sm font-medium text-gray-700">Đơn gốc liên quan</Label>
                    <div className="mt-3 space-y-4">
                      {item.orders.map((order) => (
                        <div
                          key={order.id}
                          role="button"
                          aria-label={`Xem đơn ${order.code}`}
                          onClick={() => navigate(`/system/manager/manage-order/${order.id}`)}
                          className="rounded-xl border p-4 bg-white hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-base font-semibold text-slate-700">
                              Mã đơn: <span className="text-slate-900">{order.code}</span>
                            </p>
                            <p className="text-sm text-slate-500">
                              Ngày nhận: {order.receivedAt ? new Date(order.receivedAt).toLocaleString('vi-VN') : 'Chưa có'}
                            </p>
                          </div>
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {order.orderItems?.map((oi) => (
                              <div key={oi.id} className="flex gap-3 border rounded-lg p-3 bg-slate-50">
                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                                  {oi.preset?.images?.[0] && (
                                    <img src={oi.preset.images[0]} alt={oi.preset?.styleName ?? 'Preset'} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{oi.preset?.styleName ?? 'Sản phẩm'}</div>
                                  <div className="text-xs text-gray-600 truncate">{oi.preset?.styleName}</div>
                                  <div className="mt-1 text-xs text-gray-700">
                                    SL: <span className="font-medium">{oi.quantity}</span> • Giá:
                                    <span className="font-medium"> {oi.price?.toLocaleString('vi-VN')}₫</span>
                                  </div>
                                  {oi.warrantyDate && (
                                    <div className="text-xs text-gray-500">Ngày Bảo Hành Lần 1: {new Date(oi.warrantyDate).toLocaleString('vi-VN')}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex items-center justify-end text-violet-700 text-sm font-medium">
                            <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity">Xem chi tiết đơn</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button 
            className="bg-violet-600 hover:bg-violet-700"
            onClick={() => {
              // Save all changes
              console.log('Saving changes...', itemStatuses);
              onClose();
            }}
          >
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};
