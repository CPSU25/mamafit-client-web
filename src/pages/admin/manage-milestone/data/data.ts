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

// Apply for options (milestone types)
export const applyForOptions = [
  { value: 'READY_TO_BUY', label: 'Ready to buy' },
  { value: 'PRESET', label: 'Preset' },
  { value: 'DESIGN_REQUEST', label: 'Design request' }
]
