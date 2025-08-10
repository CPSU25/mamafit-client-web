import { useEffect, useState } from 'react'
import { CheckCircle, ChevronRight, Factory, Store, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from './StatusBadge'
import { RequestTypeBadge } from './RequestTypeBadge'
import { WarrantyRequestDetailProps } from '../types'
import { useWarrantyRequestById } from '@/services/global/warranty.service'
import { StatusWarrantyRequestItem, WarrantyRequestItemForm } from '@/@types/warranty-request.types'
import warrantyAPI from '@/apis/warranty-request.api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGetBranches } from '@/services/admin/manage-branch.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageViewer } from '@/components/ui/image-viewer'

type ItemDecision = {
  status: StatusWarrantyRequestItem
  destinationType?: 'FACTORY' | 'BRANCH'
  fee?: number
  rejectedReason?: string
  estimateTime?: string
  destinationBranchId?: string
}

export const WarrantyRequestDetail = ({ request, onClose }: WarrantyRequestDetailProps) => {
  const { data: warrantyItem } = useWarrantyRequestById(request.id)
  const { data: branchesData } = useGetBranches({ pageSize: 100 }) // Get all branches
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  console.log('images', warrantyItem?.items[0].images)
  const [itemDecisions, setItemDecisions] = useState<Record<string, ItemDecision>>({})
  const [noteInternal, setNoteInternal] = useState<string>('')

  useEffect(() => {
    if (warrantyItem?.items && Array.isArray(warrantyItem.items)) {
      const initialDecisions = warrantyItem.items.reduce<Record<string, ItemDecision>>((acc, item) => {
        acc[item.orderItemId] = {
          status: item.status ?? StatusWarrantyRequestItem.PENDING,
          destinationType: item.destinationType,
          fee: item.fee ?? undefined,
          rejectedReason: item.rejectedReason ?? undefined,
          estimateTime: item.estimateTime ?? undefined,
          destinationBranchId: item.destinationBranchId ?? undefined
        }
        return acc
      }, {})
      setItemDecisions(initialDecisions)
    }
    if (warrantyItem?.noteInternal) {
      setNoteInternal(warrantyItem.noteInternal)
    }
  }, [warrantyItem])

  const handleItemDecision = (
    itemId: string,
    status: StatusWarrantyRequestItem,
    destinationType?: 'FACTORY' | 'BRANCH'
  ) => {
    setItemDecisions((prev) => {
      const currentDecision = prev[itemId] || {}

      // Reset destinationBranchId when switching to FACTORY or REJECTED
      const newDecision = {
        ...currentDecision,
        status,
        destinationType,
        // Clear branch selection when not going to branch
        destinationBranchId: destinationType === 'BRANCH' ? currentDecision.destinationBranchId : undefined
      }

      return {
        ...prev,
        [itemId]: newDecision
      }
    })
  }

  const handleItemDetailChange = (itemId: string, field: keyof ItemDecision, value: string | number | undefined) => {
    setItemDecisions((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const submitDecisionMutation = useMutation({
    mutationFn: async (data: { noteInternal: string; items: WarrantyRequestItemForm[] }) => {
      return warrantyAPI.decisionWarrantyRequest(request.id, data)
    },
    onSuccess: () => {
      toast.success('Đã cập nhật quyết định bảo hành thành công')
      queryClient.invalidateQueries({ queryKey: ['warranty-request', request.id] })
      queryClient.invalidateQueries({ queryKey: ['warranty-requests'] })
      onClose()
    },
    onError: (error) => {
      console.error('Error submitting warranty decision:', error)
      toast.error('Có lỗi xảy ra khi cập nhật quyết định bảo hành')
    }
  })

  const validateForm = (): string | null => {
    for (const [orderItemId, decision] of Object.entries(itemDecisions)) {
      if (decision.status === StatusWarrantyRequestItem.REJECTED && !decision.rejectedReason?.trim()) {
        return `Vui lòng nhập lý do từ chối cho sản phẩm ${orderItemId}`
      }
      if (decision.status === StatusWarrantyRequestItem.APPROVED && !decision.destinationType) {
        return `Vui lòng chọn nơi xử lý cho sản phẩm ${orderItemId}`
      }
      if (
        decision.status === StatusWarrantyRequestItem.APPROVED &&
        decision.destinationType === 'BRANCH' &&
        !decision.destinationBranchId
      ) {
        return `Vui lòng chọn chi nhánh xử lý cho sản phẩm ${orderItemId}`
      }
    }
    return null
  }

  const handleSubmit = () => {
    // Check if all items are already in transit
    const hasItemsToDecide = warrantyItem?.items?.some((item) => item.status !== StatusWarrantyRequestItem.IN_TRANSIT)

    if (!hasItemsToDecide) {
      toast.error('Tất cả sản phẩm đã được xử lý và đang vận chuyển. Không thể thay đổi quyết định.')
      return
    }

    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Only include items that are not in transit for the decision
    const itemsToSubmit = Object.entries(itemDecisions)
      .filter(([orderItemId]) => {
        const item = warrantyItem?.items?.find((i) => i.orderItemId === orderItemId)
        return item?.status !== StatusWarrantyRequestItem.IN_TRANSIT
      })
      .map(([orderItemId, decision]) => {
        const baseItem = {
          orderItemId,
          status: decision.status
        }

        if (decision.status === StatusWarrantyRequestItem.REJECTED) {
          // For rejected items: only rejectedReason is meaningful
          // Other fields are required by API but will be ignored by backend
          return {
            ...baseItem,
            destinationType: 'FACTORY' as const, // Required by API, but meaningless for rejected items
            destinationBranchId: null,
            fee: null, // Not applicable for rejected items
            rejectedReason: decision.rejectedReason || null,
            estimateTime: null
          }
        } else {
          // For approved items: include all relevant fields except rejectedReason
          return {
            ...baseItem,
            destinationType: decision.destinationType || 'FACTORY',
            destinationBranchId: decision.destinationType === 'BRANCH' ? decision.destinationBranchId || null : null,
            fee: decision.fee || null,
            rejectedReason: null, // Not applicable for approved items
            estimateTime: decision.estimateTime || new Date().toISOString()
          }
        }
      })

    if (itemsToSubmit.length === 0) {
      toast.error('Không có sản phẩm nào cần quyết định.')
      return
    }

    submitDecisionMutation.mutate({
      noteInternal,
      items: itemsToSubmit
    })
  }

  const getItemStatusColor = (status: StatusWarrantyRequestItem) => {
    switch (status) {
      case StatusWarrantyRequestItem.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200'
      case StatusWarrantyRequestItem.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200'
      case StatusWarrantyRequestItem.IN_TRANSIT:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getItemStatusLabel = (status: StatusWarrantyRequestItem) => {
    switch (status) {
      case StatusWarrantyRequestItem.APPROVED:
        return 'Đã duyệt'
      case StatusWarrantyRequestItem.REJECTED:
        return 'Đã từ chối'
      case StatusWarrantyRequestItem.IN_TRANSIT:
        return 'Đang vận chuyển'
      default:
        return 'Chờ xử lý'
    }
  }

  return (
    <div className='max-w-4xl max-h-[80vh] overflow-y-auto'>
      <DialogHeader className='pb-4'>
        <DialogTitle className='text-xl font-semibold text-violet-900'>
          Chi tiết yêu cầu bảo hành {warrantyItem?.sku ?? request.sku}
        </DialogTitle>
        <DialogDescription>Đánh giá và xử lý yêu cầu bảo hành từ khách hàng</DialogDescription>
      </DialogHeader>

      <div className='space-y-6'>
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-2 gap-4'>
            <div>
              <Label className='text-sm font-medium text-gray-600'>Tên khách hàng</Label>
              <p className='mt-1 text-gray-900'>{request.customer.fullName}</p>
            </div>
            <div>
              <Label className='text-sm font-medium text-gray-600'>Số điện thoại</Label>
              <p className='mt-1 text-gray-900'>{request.customer.phoneNumber}</p>
            </div>
            <div className='col-span-2'>
              <Label className='text-sm font-medium text-gray-600'>Email</Label>
              <p className='mt-1 text-gray-900'>{warrantyItem?.customer.userEmail}</p>
            </div>
          </CardContent>
        </Card>

        {/* Request Overview */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Thông tin yêu cầu</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-3 gap-4'>
            <div>
              <Label className='text-sm font-medium text-gray-600'>Loại yêu cầu</Label>
              <div className='mt-1'>
                <RequestTypeBadge type={(warrantyItem ?? request).requestType} />
              </div>
            </div>
            <div>
              <Label className='text-sm font-medium text-gray-600'>Trạng thái</Label>
              <div className='mt-1'>
                <StatusBadge status={(warrantyItem ?? request).status} />
              </div>
            </div>
            <div>
              <Label className='text-sm font-medium text-gray-600'>Tổng phí</Label>
              <p className='mt-1 text-lg font-semibold text-violet-900'>
                {warrantyItem?.totalFee ? warrantyItem?.totalFee.toLocaleString('vi-VN') : 'Cần xác định'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Internal Notes */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Ghi chú nội bộ</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder='Nhập ghi chú nội bộ...'
              value={noteInternal}
              onChange={(e) => setNoteInternal(e.target.value)}
              rows={3}
              className='w-full'
            />
          </CardContent>
        </Card>

        {/* Warranty Items */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Danh sách sản phẩm cần bảo hành</CardTitle>
            <DialogDescription>Đánh giá từng sản phẩm và quyết định nơi xử lý bảo hành</DialogDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {warrantyItem?.items?.map((item) => (
              <div key={item.orderItemId} className='border rounded-lg p-4 space-y-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900'>{item.orderItemId}</h4>
                    <p className='text-sm text-gray-600 mt-1'>
                      Trạng thái: {item.status} • Lần bảo hành: {item.warrantyRound}
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className={getItemStatusColor(
                      itemDecisions[item.orderItemId]?.status ?? StatusWarrantyRequestItem.PENDING
                    )}
                  >
                    {getItemStatusLabel(itemDecisions[item.orderItemId]?.status ?? StatusWarrantyRequestItem.PENDING)}
                  </Badge>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Images */}
                  <div>
                    <Label className='text-sm font-medium text-gray-600'>Hình ảnh</Label>
                    <div className='mt-2 grid grid-cols-2 gap-2'>
                      {item.images?.map((image, imgIndex) => (
                        <div key={imgIndex} className='relative aspect-square rounded-lg overflow-hidden bg-gray-100'>
                          <ImageViewer
                            src={image}
                            alt={`Hình ảnh ${imgIndex + 1}`}
                            className='w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer'
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description and Actions */}
                  <div className='space-y-4'>
                    <div>
                      <Label className='text-sm font-medium text-gray-600'>Mô tả vấn đề</Label>
                      <p className='mt-1 text-gray-900 text-sm'>{item.description}</p>
                    </div>

                    {/* Current Status Display for IN_TRANSIT */}
                    {item.status === StatusWarrantyRequestItem.IN_TRANSIT && (
                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3'>
                        <div className='flex items-center gap-2'>
                          <Badge className='bg-blue-600 text-white'>Đang vận chuyển</Badge>
                          <span className='text-sm text-blue-700 font-medium'>Đã được duyệt và đang vận chuyển</span>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                          <div>
                            <Label className='text-sm font-medium text-blue-800'>Nơi xử lý</Label>
                            <p className='text-sm text-blue-900 font-semibold mt-1'>
                              {item.destinationType === 'FACTORY' ? '🏭 Nhà xưởng' : '🏪 Chi nhánh'}
                            </p>
                          </div>
                          {item.trackingCode && (
                            <div>
                              <Label className='text-sm font-medium text-blue-800'>Mã vận đơn</Label>
                              <p className='text-sm text-blue-900 font-mono bg-white px-2 py-1 rounded border mt-1'>
                                {item.trackingCode}
                              </p>
                            </div>
                          )}
                        </div>

                        {item.fee && (
                          <div>
                            <Label className='text-sm font-medium text-blue-800'>Phí bảo hành</Label>
                            <p className='text-sm text-blue-900 font-semibold mt-1'>
                              {item.fee.toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        )}

                        {item.estimateTime && (
                          <div>
                            <Label className='text-sm font-medium text-blue-800'>Thời gian dự kiến hoàn thành</Label>
                            <p className='text-sm text-blue-900 mt-1'>
                              {new Date(item.estimateTime).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Decision Buttons - Only show if NOT in transit */}
                    {item.status !== StatusWarrantyRequestItem.IN_TRANSIT && (
                      <div>
                        <Label className='text-sm font-medium text-gray-600 mb-2 block'>Quyết định xử lý</Label>
                        <div className='flex gap-2 flex-wrap'>
                          <Button
                            size='sm'
                            variant={
                              itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() => handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.REJECTED)}
                            className={
                              itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'text-red-700 border-red-200 hover:bg-red-50'
                            }
                          >
                            <XCircle className='w-4 h-4 mr-1' />
                            Từ chối
                          </Button>
                          <Button
                            size='sm'
                            variant={
                              itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED &&
                              itemDecisions[item.orderItemId]?.destinationType === 'BRANCH'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.APPROVED, 'BRANCH')
                            }
                            className={
                              itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED &&
                              itemDecisions[item.orderItemId]?.destinationType === 'BRANCH'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'text-blue-700 border-blue-200 hover:bg-blue-50'
                            }
                          >
                            <Store className='w-4 h-4 mr-1' />
                            Chuyển chi nhánh
                          </Button>
                          <Button
                            size='sm'
                            variant={
                              itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED &&
                              itemDecisions[item.orderItemId]?.destinationType === 'FACTORY'
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              handleItemDecision(item.orderItemId, StatusWarrantyRequestItem.APPROVED, 'FACTORY')
                            }
                            className={
                              itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED &&
                              itemDecisions[item.orderItemId]?.destinationType === 'FACTORY'
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'text-orange-700 border-orange-200 hover:bg-orange-50'
                            }
                          >
                            <Factory className='w-4 h-4 mr-1' />
                            Chuyển nhà xưởng
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Additional Details Based on Decision - Only show if NOT in transit */}
                    {item.status !== StatusWarrantyRequestItem.IN_TRANSIT && (
                      <>
                        {itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.REJECTED && (
                          <div className='space-y-3 p-3 bg-red-50 rounded-lg'>
                            <div>
                              <Label className='text-sm font-medium text-red-800'>Lý do từ chối *</Label>
                              <Textarea
                                placeholder='Nhập lý do từ chối bảo hành...'
                                value={itemDecisions[item.orderItemId]?.rejectedReason || ''}
                                onChange={(e) =>
                                  handleItemDetailChange(item.orderItemId, 'rejectedReason', e.target.value)
                                }
                                rows={2}
                                className='mt-1'
                              />
                            </div>
                          </div>
                        )}

                        {itemDecisions[item.orderItemId]?.status === StatusWarrantyRequestItem.APPROVED && (
                          <div className='space-y-3 p-3 bg-green-50 rounded-lg'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                              <div>
                                <Label className='text-sm font-medium text-green-800'>Phí bảo hành (VNĐ)</Label>
                                <Input
                                  type='number'
                                  placeholder='0'
                                  value={itemDecisions[item.orderItemId]?.fee || ''}
                                  onChange={(e) =>
                                    handleItemDetailChange(item.orderItemId, 'fee', Number(e.target.value) || 0)
                                  }
                                  className='mt-1'
                                />
                              </div>
                              <div>
                                <Label className='text-sm font-medium text-green-800'>Thời gian ước tính (ngày)</Label>
                                <Input
                                  type='number'
                                  placeholder='7'
                                  value={
                                    itemDecisions[item.orderItemId]?.estimateTime
                                      ? Math.ceil(
                                          (new Date(itemDecisions[item.orderItemId]?.estimateTime || '').getTime() -
                                            new Date().getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        )
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const days = Number(e.target.value) || 0
                                    const estimateDate = new Date()
                                    estimateDate.setDate(estimateDate.getDate() + days)
                                    handleItemDetailChange(item.orderItemId, 'estimateTime', estimateDate.toISOString())
                                  }}
                                  className='mt-1'
                                />
                              </div>
                            </div>

                            {/* Branch Selection when destinationType is BRANCH */}
                            {itemDecisions[item.orderItemId]?.destinationType === 'BRANCH' && (
                              <div>
                                <Label className='text-sm font-medium text-green-800'>Chọn chi nhánh *</Label>
                                <Select
                                  value={itemDecisions[item.orderItemId]?.destinationBranchId || ''}
                                  onValueChange={(value) =>
                                    handleItemDetailChange(item.orderItemId, 'destinationBranchId', value)
                                  }
                                >
                                  <SelectTrigger className='mt-1'>
                                    <SelectValue placeholder='Chọn chi nhánh xử lý...' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {branchesData?.data?.items?.map((branch) => (
                                      <SelectItem key={branch.id} value={branch.id}>
                                        <div className='flex flex-col'>
                                          <span className='font-medium'>{branch.name}</span>
                                          <span className='text-sm text-gray-500'>
                                            {branch.street}, {branch.ward}, {branch.district}, {branch.province}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className='text-sm text-green-700'>
                              <CheckCircle className='w-4 h-4 inline mr-1' />
                              Được chấp nhận xử lý tại:{' '}
                              <strong>
                                {itemDecisions[item.orderItemId]?.destinationType === 'FACTORY'
                                  ? 'Nhà xưởng'
                                  : 'Chi nhánh'}
                              </strong>
                              {itemDecisions[item.orderItemId]?.destinationType === 'BRANCH' &&
                                itemDecisions[item.orderItemId]?.destinationBranchId && (
                                  <>
                                    {' - '}
                                    <strong>
                                      {branchesData?.data?.items?.find(
                                        (b) => b.id === itemDecisions[item.orderItemId]?.destinationBranchId
                                      )?.name || 'Chi nhánh đã chọn'}
                                    </strong>
                                  </>
                                )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {/* Original Order Info */}
                {Array.isArray(item.orders) && item.orders.length > 0 && (
                  <div className='mt-4 border-t pt-4'>
                    <Label className='text-sm font-medium text-gray-700'>Đơn gốc liên quan</Label>
                    <div className='mt-3 space-y-4'>
                      {item.orders.map((order) => (
                        <div
                          key={order.id}
                          role='button'
                          aria-label={`Xem đơn ${order.code}`}
                          onClick={() => navigate(`/system/manager/manage-order/${order.id}`)}
                          className='rounded-xl border p-4 bg-white hover:shadow-md transition-all cursor-pointer group'
                        >
                          <div className='flex items-center justify-between gap-3'>
                            <p className='text-base font-semibold text-slate-700'>
                              Mã đơn: <span className='text-slate-900'>{order.code}</span>
                            </p>
                            <p className='text-sm text-slate-500'>
                              Ngày nhận:{' '}
                              {order.receivedAt ? new Date(order.receivedAt).toLocaleString('vi-VN') : 'Chưa có'}
                            </p>
                          </div>
                          <div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-3'>
                            {order.orderItems?.map((oi) => (
                              <div key={oi.id} className='flex gap-3 border rounded-lg p-3 bg-slate-50'>
                                <div className='w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 border'>
                                  {oi.preset?.images?.[0] && (
                                    <img
                                      src={oi.preset.images[0]}
                                      alt={oi.preset?.styleName ?? 'Preset'}
                                      className='w-full h-full object-cover'
                                    />
                                  )}
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <div className='text-sm font-semibold text-gray-900 truncate'>
                                    {oi.preset?.styleName ?? 'Sản phẩm'}
                                  </div>
                                  <div className='text-xs text-gray-600 truncate'>{oi.preset?.styleName}</div>
                                  <div className='mt-1 text-xs text-gray-700'>
                                    SL: <span className='font-medium'>{oi.quantity}</span> • Giá:
                                    <span className='font-medium'> {oi.price?.toLocaleString('vi-VN')}₫</span>
                                  </div>
                                  {oi.warrantyDate && (
                                    <div className='text-xs text-gray-500'>
                                      Ngày Bảo Hành Lần 1: {new Date(oi.warrantyDate).toLocaleString('vi-VN')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className='mt-3 flex items-center justify-end text-violet-700 text-sm font-medium'>
                            <span className='mr-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                              Xem chi tiết đơn
                            </span>
                            <ChevronRight className='w-4 h-4' />
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
        <div className='flex justify-end gap-3 pt-4 border-t'>
          <Button variant='outline' onClick={onClose} disabled={submitDecisionMutation.isPending}>
            Đóng
          </Button>
          {(() => {
            const hasItemsToDecide = warrantyItem?.items?.some(
              (item) => item.status !== StatusWarrantyRequestItem.IN_TRANSIT
            )

            return (
              <Button
                className='bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400'
                onClick={handleSubmit}
                disabled={submitDecisionMutation.isPending || !hasItemsToDecide}
              >
                {submitDecisionMutation.isPending
                  ? 'Đang xử lý...'
                  : !hasItemsToDecide
                    ? 'Đã xử lý xong'
                    : 'Lưu quyết định'}
              </Button>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
