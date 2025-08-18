// Sort options for milestones
export const sortOptions = [
  { value: 'CREATED_AT_DESC', label: 'Mới nhất' },
  { value: 'CREATED_AT_ASC', label: 'Cũ nhất' },
  { value: 'NAME_ASC', label: 'Tên A-Z' },
  { value: 'NAME_DESC', label: 'Tên Z-A' },
  { value: 'sequenceorder_asc', label: 'Thứ tự tăng dần' },
  { value: 'sequenceorder_desc', label: 'Thứ tự giảm dần' }
]

// Page size options
export const pageSizeOptions = [
  { value: '5', label: '5 / trang' },
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' }
]

// Apply for options (milestone types) - Updated with all enum values
export const applyForOptions = [
  { value: 'READY_TO_BUY', label: 'Sẵn sàng mua', color: 'bg-gradient-to-r from-green-500 to-green-600' },
  { value: 'PRESET', label: 'Mẫu có sẵn', color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
  { value: 'DESIGN_REQUEST', label: 'Yêu cầu thiết kế', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
  { value: 'WARRANTY', label: 'Bảo hành', color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
  { value: 'ADD_ON', label: 'Dịch vụ thêm', color: 'bg-gradient-to-r from-pink-500 to-pink-600' },
  { value: 'QC_FAIL', label: 'QC thất bại', color: 'bg-gradient-to-r from-red-500 to-red-600' }
]
