// Page size options
export const pageSizeOptions = [
  { value: '5', label: '5 / trang' },
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' }
]

// Discount type options
export const discountTypeOptions = [
  { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
  { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VND)' }
]

// Status options for voucher batch
export const voucherBatchStatusOptions = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'PENDING', label: 'Chưa bắt đầu' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'USED_UP', label: 'Hết voucher' }
]

// Status options for voucher discount
export const voucherDiscountStatusOptions = [
  { value: 'AVAILABLE', label: 'Khả dụng' },
  { value: 'USED', label: 'Đã sử dụng' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'DISABLED', label: 'Vô hiệu hóa' }
]

// Sort options for vouchers
export const sortOptions = [
  { value: 'CREATED_AT_DESC', label: 'Mới nhất' },
  { value: 'CREATED_AT_ASC', label: 'Cũ nhất' },
  { value: 'BATCH_NAME_ASC', label: 'Tên A-Z' },
  { value: 'BATCH_NAME_DESC', label: 'Tên Z-A' },
  { value: 'START_DATE_ASC', label: 'Ngày bắt đầu tăng dần' },
  { value: 'START_DATE_DESC', label: 'Ngày bắt đầu giảm dần' },
  { value: 'END_DATE_ASC', label: 'Ngày kết thúc tăng dần' },
  { value: 'END_DATE_DESC', label: 'Ngày kết thúc giảm dần' }
]

// Tab options
export const voucherTabs = [
  { value: 'batch', label: 'Loại Voucher' },
  { value: 'discount', label: 'Voucher' }
] as const

export type VoucherTabType = (typeof voucherTabs)[number]['value']
