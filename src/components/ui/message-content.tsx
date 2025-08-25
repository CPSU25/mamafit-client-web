import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageViewer } from '@/components/ui/image-viewer'
import { MessageType } from '@/@types/chat.types'
import { usePresetById } from '@/hooks/use-preset'
import { useOrder } from '@/services/admin/manage-order.service'
import { cn } from '@/lib/utils/utils'
import {
  Download,
  FileText,
  FileImage,
  File,
  Palette,
  Sparkles,
  Eye,
  Package,
  ExternalLink,
  RefreshCw,
  User,
  Image as ImageIcon
} from 'lucide-react'
import { useDesignRequestById } from '@/services/designer/design_request.service'

// Helper function để normalize message type từ bất kỳ nguồn nào
function normalizeMessageType(type: MessageType | number | string | undefined): number {
  // Nếu là undefined hoặc null, trả về Text (0)
  if (type === undefined || type === null) {
    return MessageType.Text // 0
  }

  // Nếu đã là số, trả về luôn
  if (typeof type === 'number') {
    return type
  }

  // Nếu là string, cố gắng parse
  if (typeof type === 'string') {
    switch (type.toLowerCase()) {
      case 'text':
        return MessageType.Text // 0
      case 'image':
        return MessageType.Image // 1
      case 'file':
        return MessageType.File // 2
      case 'design_request':
      case 'designrequest':
        return MessageType.Design_Request // 3
      case 'preset':
        return MessageType.Preset // 4
      default: {
        // Nếu là string số ("0", "1", "2", etc.)
        const parsed = parseInt(type, 10)
        return isNaN(parsed) ? MessageType.Text : parsed
      }
    }
  }

  // Fallback về Text nếu không nhận diện được
  console.warn('⚠️ Unknown message type format:', type, 'fallback to Text')
  return MessageType.Text
}

interface MessageContentProps {
  message: string
  type?: MessageType | number | string | undefined
  isCurrentUser?: boolean
  className?: string
}

// Component hiển thị yêu cầu thiết kế (fallback cho tin nhắn không có API data)
function DesignRequestMessage({ message }: { message: string }) {
  try {
    const designData = JSON.parse(message)

    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Palette className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Yêu cầu thiết kế</h3>
              <p className="text-sm text-slate-500">Thiết kế mới</p>
            </div>
          </div>

          {/* Content */}
          {designData.title && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-800 font-medium">{designData.title}</p>
            </div>
          )}
          
          {designData.messageContent && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{designData.messageContent}</p>
            </div>
          )}
          
          {designData.description && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">{designData.description}</p>
            </div>
          )}

          {/* Requirements */}
          {designData.requirements && Array.isArray(designData.requirements) && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Yêu cầu chi tiết</p>
              <div className="space-y-2">
                {designData.requirements.map((req: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-slate-50 rounded-md">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-slate-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Info */}
          {(designData.orderCode || designData.orderId) && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Package className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                Đơn hàng: #{designData.orderCode || designData.orderId}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch {
    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Palette className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-medium text-slate-800">Yêu cầu thiết kế</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

// Component hiển thị tin nhắn hình ảnh
function ImageMessage({ message }: { message: string }) {
  try {
    // Parse JSON để lấy danh sách hình ảnh
    const images = JSON.parse(message)

    if (Array.isArray(images) && images.length > 0) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {images.slice(0, 4).map((imageUrl: string, index: number) => (
              <div key={index} className="group relative overflow-hidden rounded-lg">
                <ImageViewer
                  src={imageUrl}
                  alt={`Hình ảnh ${index + 1}`}
                  containerClassName="w-full"
                  thumbnailClassName="w-full h-28 object-cover transition-transform duration-200 group-hover:scale-105"
                  title={`Hình ảnh ${index + 1}`}
                />
              </div>
            ))}
          </div>
          {images.length > 4 && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <ImageIcon className="h-4 w-4 text-slate-500" />
              <p className="text-xs text-slate-600">
                +{images.length - 4} hình ảnh khác
              </p>
            </div>
          )}
        </div>
      )
    }
  } catch {
    // Nếu không parse được JSON, coi như là URL đơn lẻ
    if (message.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      return (
        <div className="group relative overflow-hidden rounded-lg max-w-xs">
          <ImageViewer
            src={message}
            alt="Hình ảnh"
            className="w-full"
            thumbnailClassName="w-full h-40 object-cover transition-transform duration-200 group-hover:scale-105"
            title="Hình ảnh"
          />
        </div>
      )
    }
  }

  // Fallback về text nếu không phải hình ảnh hợp lệ
  return <span className="text-sm">{message}</span>
}

// Component hiển thị file đính kèm
function FileMessage({ message }: { message: string }) {
  try {
    const fileData = JSON.parse(message)

    if (fileData.url && fileData.name) {
      const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()

        switch (ext) {
          case 'pdf':
            return <FileText className="h-5 w-5 text-red-500" />
          case 'jpg':
          case 'jpeg':
          case 'png':
          case 'gif':
          case 'webp':
            return <FileImage className="h-5 w-5 text-blue-500" />
          default:
            return <File className="h-5 w-5 text-slate-500" />
        }
      }

      return (
        <Card className="max-w-sm border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                {getFileIcon(fileData.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{fileData.name}</p>
                {fileData.size && (
                  <p className="text-xs text-slate-500">
                    {(fileData.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={() => window.open(fileData.url, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = fileData.url
                    a.download = fileData.name
                    a.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  } catch {
    // Fallback về link đơn giản
    if (message.startsWith('http')) {
      return (
        <Button
          variant="outline"
          className="gap-2 hover:bg-slate-50"
          onClick={() => window.open(message, '_blank')}
        >
          <ExternalLink className="h-4 w-4" />
          Tải xuống file
        </Button>
      )
    }
  }

  return <span className="text-sm">{message}</span>
}

// Component hiển thị yêu cầu thiết kế với API data
function EnhancedDesignRequestMessage({ message }: { message: string }) {
  const designData = JSON.parse(message)
  console.log('🎨 Parsing design request message:', designData)

  // Lấy orderId và designRequestId từ JSON
  const orderId = designData.orderId
  const designRequestId = designData.designRequestId
  const messageContent = designData.messageContent || 'Yêu cầu thiết kế mới'

  console.log('🎯 Extracted orderId:', orderId, 'designRequestId:', designRequestId)

  // Fetch order data từ API
  const { data: orderDetails, isLoading: isLoadingOrder, error: orderError } = useOrder(orderId)
  // Fetch design request data từ API
  const {
    data: designRequestDetails,
    isLoading: isLoadingDesign,
    error: designError
  } = useDesignRequestById(designRequestId)

  try {
    console.log('🔍 Order details from API:', { orderDetails, isLoadingOrder, orderError })
    console.log('🔍 Design request details from API:', { designRequestDetails, isLoadingDesign, designError })

    const isLoading = isLoadingOrder || isLoadingDesign
    const hasError = orderError || designError

    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Palette className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">Yêu cầu thiết kế</h3>
              <p className="text-sm text-slate-500">Thiết kế mới</p>
            </div>
            {isLoading && (
              <div className="p-2 bg-slate-100 rounded-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-600" />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{messageContent}</p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : hasError ? (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">❌ Không thể tải thông tin</p>
              <div className="mt-2 space-y-1 text-xs text-red-600">
                <p>Order ID: {orderId}</p>
                <p>Design Request ID: {designRequestId}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Order Information */}
              {orderDetails?.data && (
                <div className="p-3 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Thông tin đơn hàng</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-t border-slate-200">
                      <span className="text-sm text-slate-600">Mã đơn:</span>
                      <span className="text-sm font-medium text-slate-900">#{orderDetails.data.code}</span>
                    </div>

                    {orderDetails.data.totalPaid && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Giá trị:</span>
                        <span className="text-sm font-medium text-slate-900">
                          {Number(orderDetails.data.totalPaid).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    )}

                    {orderDetails.data.status && (
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
                          {orderDetails.data.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Design Request Details */}
              {designRequestDetails && (
                <div className="space-y-3">
                  {/* Description */}
                  {designRequestDetails.description && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium text-slate-700 mb-2">Mô tả yêu cầu:</p>
                      <p className="text-sm text-slate-700">{designRequestDetails.description}</p>
                    </div>
                  )}

                  {/* Reference Images */}
                  {designRequestDetails.images &&
                    Array.isArray(designRequestDetails.images) &&
                    designRequestDetails.images.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Hình ảnh tham khảo:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {designRequestDetails.images.slice(0, 4).map((imageUrl: string, index: number) => (
                            <div key={index} className="group relative overflow-hidden rounded-lg">
                              <ImageViewer
                                src={imageUrl}
                                alt={`Thiết kế ${index + 1}`}
                                className="w-full"
                                thumbnailClassName="w-full h-20 object-cover transition-transform duration-200 group-hover:scale-105"
                                title={`Thiết kế ${index + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        {designRequestDetails.images.length > 4 && (
                          <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <ImageIcon className="h-3 w-3 text-slate-500" />
                            <p className="text-xs text-slate-600">
                              +{designRequestDetails.images.length - 4} hình ảnh khác
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Creator Info */}
                  {designRequestDetails.username && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <User className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-600">Tạo bởi: {designRequestDetails.username}</span>
                    </div>
                  )}
                </div>
              )}

              {/* IDs Info */}
              <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Package className="h-3 w-3" />
                  <span>Đơn hàng: #{orderId.substring(0, 8)}...</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Palette className="h-3 w-3" />
                  <span>Yêu cầu: #{designRequestId.substring(0, 8)}...</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (parseError) {
    console.error('❌ Error parsing design request message:', parseError)

    // Fallback về component cũ nếu không parse được JSON
    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Palette className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-medium text-slate-800">Yêu cầu thiết kế</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{message}</p>
          </div>
          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-500">⚠️ Lỗi parse JSON</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

// Component hiển thị preset với API data
function EnhancedPresetMessage({ message }: { message: string }) {
  const presetData = JSON.parse(message)
  console.log('📦 Parsing preset message:', presetData)

  // Lấy presetId từ JSON
  const presetId = presetData.presetId
  const orderId = presetData.orderId || 'N/A'

  console.log('🎯 Extracted presetId:', presetId, 'orderId:', orderId)

  // Fetch preset data từ API
  const { data: presetDetails, isLoading, error } = usePresetById(presetId)
  try {
    console.log('🔍 Preset details from API:', { presetDetails, isLoading, error })
    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">Preset thiết kế</h3>
              <p className="text-sm text-slate-500">Mẫu thiết kế</p>
            </div>
            {isLoading && (
              <div className="p-2 bg-slate-100 rounded-lg">
                <RefreshCw className="h-4 w-4 animate-spin text-slate-600" />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : error ? (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 font-medium">❌ Không thể tải thông tin preset</p>
              <p className="text-xs text-red-600 mt-1">ID: {presetId}</p>
            </div>
          ) : presetDetails?.data ? (
            <div className="space-y-3">
              {/* Title and Name */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-sm text-slate-800">{presetDetails.data.styleName || 'Preset thiết kế'}</h4>
                {presetDetails.data.name && (
                  <p className="text-xs text-slate-500 mt-1">{presetDetails.data.name}</p>
                )}
              </div>

              {/* Images */}
              {presetDetails.data.images &&
                Array.isArray(presetDetails.data.images) &&
                presetDetails.data.images.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Hình ảnh thiết kế:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {presetDetails.data.images.slice(0, 4).map((imageUrl: string, index: number) => (
                        <div key={index} className="group relative overflow-hidden rounded-lg">
                          <ImageViewer
                            src={imageUrl}
                            alt={`Preset ${index + 1}`}
                            className="w-full"
                            thumbnailClassName="w-full h-20 object-cover transition-transform duration-200 group-hover:scale-105"
                            title={`${presetDetails.data.styleName} - Ảnh ${index + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                    {presetDetails.data.images.length > 4 && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                        <ImageIcon className="h-3 w-3 text-slate-500" />
                        <p className="text-xs text-slate-600">
                          +{presetDetails.data.images.length - 4} hình ảnh khác
                        </p>
                      </div>
                    )}
                  </div>
                )}

              {/* Price and Details */}
              <div className="space-y-3">
                {presetDetails.data.price && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Giá:</span>
                      <span className="text-sm font-medium text-slate-900">
                        {Number(presetDetails.data.price).toLocaleString('vi-VN')}₫
                      </span>
                    </div>
                  </div>
                )}

                {/* Style Badge */}
                {presetDetails.data.styleName && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-slate-300 text-slate-700">
                      {presetDetails.data.styleName}
                    </Badge>
                  </div>
                )}

                {/* Order ID */}
                {orderId && orderId !== 'N/A' && (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                    <Package className="h-3 w-3 text-slate-500" />
                    <span className="text-xs text-slate-600">Đơn hàng: #{orderId}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700">Không tìm thấy thông tin preset</p>
              <p className="text-xs text-slate-500 mt-1">ID: {presetId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch (parseError) {
    console.error('❌ Error parsing preset message:', parseError)

    // Fallback về component cũ nếu không parse được JSON
    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-medium text-slate-800">Preset thiết kế</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{message}</p>
          </div>
          <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-500">⚠️ Lỗi parse JSON</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

// Component hiển thị preset
function PresetMessage({ message }: { message: string }) {
  try {
    const presetData = JSON.parse(message)

    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">Preset thiết kế</h3>
              <p className="text-sm text-slate-500">Mẫu thiết kế</p>
            </div>
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-slate-200">
              {presetData.isDefault ? 'Mặc định' : 'Tùy chỉnh'}
            </Badge>
          </div>

          {/* Style Name */}
          {presetData.styleName && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-sm text-slate-800">{presetData.styleName}</p>
            </div>
          )}

          {/* Images */}
          {presetData.images && Array.isArray(presetData.images) && presetData.images.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Hình ảnh thiết kế:</p>
              <div className="grid grid-cols-2 gap-2">
                {presetData.images.slice(0, 4).map((imageUrl: string, index: number) => (
                  <div key={index} className="group relative overflow-hidden rounded-lg">
                    <ImageViewer
                      key={index}
                      src={imageUrl}
                      alt={`Preset ${index + 1}`}
                      className="w-full"
                      thumbnailClassName="w-full h-20 object-cover transition-transform duration-200 group-hover:scale-105"
                      title={`Preset ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
              {presetData.images.length > 4 && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                  <ImageIcon className="h-3 w-3 text-slate-500" />
                  <p className="text-xs text-slate-600">
                    +{presetData.images.length - 4} hình ảnh khác
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          {presetData.price && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Giá:</span>
                <span className="text-sm font-medium text-slate-900">
                  {Number(presetData.price).toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {presetData.description && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600">{presetData.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  } catch {
    return (
      <Card className="max-w-sm border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-slate-600" />
            </div>
            <span className="font-medium text-slate-800">Preset thiết kế</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">{message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }
}

// Component chính
export function MessageContent({ message, type, className }: MessageContentProps) {
  const messageType = normalizeMessageType(type)

  // Kiểm tra nếu message có format preset (chứa presetId)
  const isPresetMessage = (() => {
    try {
      const parsed = JSON.parse(message)
      return parsed.presetId && typeof parsed.presetId === 'string'
    } catch {
      return false
    }
  })()

  // Debug log để kiểm tra messageType
  console.log('🔍 MessageContent Debug:', {
    originalType: type,
    convertedType: messageType,
    message: message.substring(0, 50) + '...',
    isPresetType: messageType === 4,
    isPresetMessage: isPresetMessage,
    typeOfOriginalType: typeof type,
    MessageTypeEnum: {
      Text: MessageType.Text,
      Image: MessageType.Image,
      File: MessageType.File,
      Design_Request: MessageType.Design_Request,
      Preset: MessageType.Preset
    }
  })

  const content = (() => {
    // Ưu tiên kiểm tra nội dung preset trước khi kiểm tra type
    if (isPresetMessage) {
      console.log('✨ Detected PRESET by content analysis!')
      return <EnhancedPresetMessage message={message} />
    }

    switch (messageType) {
      case 1: // MessageType.Image
        console.log('📷 Rendering Image message')
        return <ImageMessage message={message} />

      case 2: // MessageType.File
        console.log('📎 Rendering File message')
        return <FileMessage message={message} />

      case 3: // MessageType.Design_Request
        console.log('🎨 Rendering Design Request message')
        // Kiểm tra nếu message có orderId và designRequestId thì dùng Enhanced version
        try {
          const parsed = JSON.parse(message)
          console.log('🔍 Parsed design request message:', parsed)
          if (parsed.orderId && parsed.designRequestId) {
            console.log(
              '🎆 Using Enhanced Design Request Message with orderId:',
              parsed.orderId,
              'designRequestId:',
              parsed.designRequestId
            )
            return <EnhancedDesignRequestMessage message={message} />
          }
        } catch (parseError) {
          console.log('⚠️ Failed to parse design request message, using fallback:', parseError)
        }
        console.log('📦 Using regular Design Request Message')
        return <DesignRequestMessage message={message} />

      case 4: // MessageType.Preset
        console.log('✨ Rendering Preset message by type')
        // Kiểm tra nếu message có presetId (từ SignalR) thì dùng Enhanced version
        try {
          const parsed = JSON.parse(message)
          console.log('🔍 Parsed preset message:', parsed)
          if (parsed.presetId) {
            console.log('🎆 Using Enhanced Preset Message with presetId:', parsed.presetId)
            return <EnhancedPresetMessage message={message} />
          }
        } catch (parseError) {
          console.log('⚠️ Failed to parse preset message, using fallback:', parseError)
        }
        console.log('📦 Using regular Preset Message')
        return <PresetMessage message={message} />

      case 0: // MessageType.Text
      default:
        console.log('💬 Rendering Text message')
        return (
          <span className="text-sm whitespace-pre-wrap break-words text-white">
            {message}
          </span>
        )
    }
  })()

  return <div className={cn('w-full', className)}>{content}</div>
}

export default MessageContent
