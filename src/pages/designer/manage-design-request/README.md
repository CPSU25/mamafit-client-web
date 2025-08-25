# Manage Design Request - Component Structure

## Overview
File `manage-design-request-clean.tsx` đã được tách thành các component nhỏ để dễ debug và maintain hơn.

## Component Structure

### 1. **DesignRequestHeader** (`components/design-request-header.tsx`)
- Header với title, search, filter và view mode toggle
- Props: `searchTerm`, `onSearchChange`, `statusFilter`, `onStatusFilterChange`, `viewMode`, `onViewModeChange`

### 2. **DesignRequestStats** (`components/design-request-stats.tsx`)
- Hiển thị thống kê tổng quan: tổng yêu cầu, chờ xử lý, đang thiết kế, hoàn thành
- Props: `designRequests`

### 3. **DesignRequestCard** (`components/design-request-card.tsx`)
- Card hiển thị thông tin từng yêu cầu thiết kế
- Props: `request`, `onViewDetail`, `onStartChat`, `onQuickStart`, `onComplete`

### 4. **DesignRequestGrid** (`components/design-request-grid.tsx`)
- Grid layout cho các card design request
- Props: `requests`, `onViewDetail`, `onStartChat`, `onQuickStart`, `onComplete`

### 5. **ChatPanel** (`components/chat-panel.tsx`)
- Panel chat với khách hàng
- Props: `isOpen`, `onClose`, `activeRequest`, `onSendMessage`, `messages`, `isLoadingMessages`, `newMessage`, `onNewMessageChange`, `isMinimized`, `onToggleMinimize`

### 6. **QuickStartDialog** (`components/quick-start-dialog.tsx`)
- Dialog xác nhận bắt đầu thiết kế
- Props: `isOpen`, `onClose`, `request`, `onConfirm`

### 7. **CompleteDesignDialog** (`components/complete-design-dialog.tsx`)
- Dialog hoàn thành thiết kế với ghi chú và hình ảnh
- Props: `isOpen`, `onClose`, `request`, `note`, `onNoteChange`, `image`, `onImageChange`, `onConfirm`

## Types (`types.ts`)
- `ExtendedOrderTaskItem`: Interface cho design request
- `ChatMessage`: Interface cho tin nhắn chat
- Props interfaces cho tất cả components

## Main Component (`manage-design-request-clean.tsx`)
- Quản lý state và logic chính
- Sử dụng tất cả các component con
- Xử lý API calls và real-time chat

## Benefits of New Structure

### ✅ **Dễ Debug**
- Mỗi component có trách nhiệm rõ ràng
- Lỗi dễ xác định và sửa
- Có thể test từng component riêng biệt

### ✅ **Dễ Maintain**
- Code ngắn gọn, dễ đọc
- Logic được tách biệt rõ ràng
- Dễ thêm/sửa tính năng

### ✅ **Reusable**
- Components có thể tái sử dụng ở nơi khác
- Props interface rõ ràng
- Dễ customize

### ✅ **Performance**
- Chỉ re-render component cần thiết
- Memoization dễ dàng hơn
- Bundle size nhỏ hơn

## Usage Example

```tsx
import {
  DesignRequestHeader,
  DesignRequestStats,
  DesignRequestGrid
} from './components'

const MyPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <Main>
      <DesignRequestHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <DesignRequestStats designRequests={requests} />
      
      <DesignRequestGrid
        requests={filteredRequests}
        onViewDetail={handleViewDetail}
        onStartChat={handleStartChat}
        onQuickStart={handleQuickStart}
        onComplete={handleComplete}
      />
    </Main>
  )
}
```

## Next Steps
1. **Fix Type Issues**: Cần cập nhật types để khớp với API response thực tế
2. **Add List View**: Implement list view cho design requests
3. **Add Tests**: Viết unit tests cho từng component
4. **Add Error Boundaries**: Xử lý lỗi tốt hơn
5. **Optimize Performance**: Thêm React.memo, useMemo, useCallback

## Notes
- File cũ `manage-design-request-clean.tsx` đã được xóa
- File mới `manage-design-request-clean.tsx` sử dụng cấu trúc component mới
- Cần kiểm tra và sửa các type errors trước khi deploy
