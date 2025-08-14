export const sortOptions = [
  { value: 'CREATED_AT_DESC', label: 'Mới nhất' },
  { value: 'CREATED_AT_ASC', label: 'Cũ nhất' },
  { value: 'TOTAL_AMOUNT_DESC', label: 'Giá cao nhất' },
  { value: 'TOTAL_AMOUNT_ASC', label: 'Giá thấp nhất' },
  { value: 'CODE_ASC', label: 'Mã đơn A-Z' },
  { value: 'CODE_DESC', label: 'Mã đơn Z-A' }
]

export const pageSizeOptions = [
  { value: '5', label: '5 / trang' },
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' }
]

export const orderStatusOptions = [
  { value: 'CREATED', label: 'Đã tạo', color: 'bg-gray-100 text-gray-800' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'Đang sản xuất', color: 'bg-purple-100 text-purple-800' },
  { value: 'AWAITING_PAID_REST', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PACKAGING', label: 'Đóng gói', color: 'bg-pink-100 text-pink-800' },
  { value: 'DELIVERING', label: 'Đang giao', color: 'bg-green-100 text-green-800' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  { value: 'PICKUP_IN_PROGRESS', label: 'Đang lấy hàng', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'AWAITING_PAID_WARRANTY', label: 'Chờ thanh toán bảo hành', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'WARRANTY_CHECK', label: 'Kiểm tra bảo hành', color: 'bg-teal-100 text-teal-800' },
  { value: 'CANCELLED', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  { value: 'RETURNED', label: 'Đã trả lại', color: 'bg-red-100 text-red-800' },
  { value: 'EXPIRED', label: 'Hết hạn', color: 'bg-gray-100 text-gray-800' }
]

export const paymentStatusOptions = [
  { value: 'PENDING', label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PAID_FULL', label: 'Đã thanh toán đủ', color: 'bg-green-100 text-green-800' },
  { value: 'FAILED', label: 'Thanh toán thất bại', color: 'bg-red-100 text-red-800' },
  { value: 'PAID_DEPOSIT', label: 'Đã cọc', color: 'bg-blue-100 text-blue-800' },
  { value: 'PAID_DEPOSIT_COMPLETED', label: 'Hoàn thành cọc', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELED', label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
  { value: 'EXPIRED', label: 'Hết hạn', color: 'bg-gray-100 text-gray-800' }
]

export const paymentMethodOptions = [
  { value: 'CASH', label: 'Tiền mặt' },
  { value: 'ONLINE_BANKING', label: 'Chuyển khoản' }
]

export const deliveryMethodOptions = [
  { value: 'DELIVERY', label: 'Giao hàng' },
  { value: 'PICK_UP', label: 'Lấy tại cửa hàng' }
]

export const typeOrderOptions = [
  { value: 'NORMAL', label: 'Đơn hàng thường' },
  { value: 'WARRANTY', label: 'Đơn hàng bảo hành' },
  { value: 'DESIGN', label: 'Yêu cầu thiết kế' }
]

// Helper function to get status color
export const getStatusColor = (status: string, type: 'order' | 'payment' = 'order') => {
  const options = type === 'order' ? orderStatusOptions : paymentStatusOptions
  return options.find((option) => option.value === status)?.color || 'bg-gray-100 text-gray-800'
}

// Helper function to get status label
export const getStatusLabel = (status: string, type: 'order' | 'payment' = 'order') => {
  const options = type === 'order' ? orderStatusOptions : paymentStatusOptions
  return options.find((option) => option.value === status)?.label || status
}

export const getDeliveryMethodLabel = (deliveryMethod: string) => {
  return deliveryMethodOptions.find((option) => option.value === deliveryMethod)?.label || deliveryMethod
}
export const getTypeOrderLabel = (type: string) => {
  return typeOrderOptions.find((option) => option.value === type)?.label || type
}

export const itemTypeOptions = [
  { value: 'PRESET', label: 'Sản phẩm template', color: 'bg-gray-100 text-gray-800' },
  { value: 'DESIGN_REQUEST', label: 'Yêu cầu thiết kế', color: 'bg-purple-100 text-purple-800' },
  { value: 'READY_TO_BUY', label: 'Sản phẩm sẵn có', color: 'bg-green-100 text-green-800' }
]

export const getItemTypeLabel = (itemType: string) => {
  return itemTypeOptions.find((option) => option.value === itemType)?.label || itemType
}

export const getItemTypeColor = (itemType: string) => {
  return itemTypeOptions.find((option) => option.value === itemType)?.color || 'bg-gray-100 text-gray-800'
}
