import { useState, useEffect, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { toast } from 'sonner'
import { useDesignerTasks, useUpdateTaskStatus } from '@/hooks/use-designer-tasks'
import { useCreateRoom, useMyRooms, useRoomMessages, chatService, useChatCache } from '@/services/chat/chat.service'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { SendPresetInChat } from './components/send-preset-in-chat'
import { ChatMessage as ApiChatMessage } from '@/@types/chat.types'
import {
  DesignRequestHeader,
  DesignRequestStats,
  DesignRequestGrid,
  ChatPanel,
  QuickStartDialog,
  CompleteDesignDialog,
  DesignRequestDetailDialog
} from './components'
import { ExtendedOrderTaskItem, ChatMessage } from './types'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'

const ManageDesignRequestPage = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<ExtendedOrderTaskItem | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Chat states
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false)
  const [isChatMinimized, setIsChatMinimized] = useState(false)
  const [activeChatRequest, setActiveChatRequest] = useState<ExtendedOrderTaskItem | null>(null)
  const [chatRoomId, setChatRoomId] = useState<string>('')
  const [newMessage, setNewMessage] = useState('')
  const [isPresetDialogOpen, setIsPresetDialogOpen] = useState(false)

  // Quick start design states
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false)
  const [quickStartRequest, setQuickStartRequest] = useState<ExtendedOrderTaskItem | null>(null)

  // Complete design states
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)
  const [completeRequest, setCompleteRequest] = useState<ExtendedOrderTaskItem | null>(null)
  const [completeNote, setCompleteNote] = useState('')
  const [completeImage, setCompleteImage] = useState<string>('')

  const { user } = useAuthStore()
  const { invalidateRoomMessages, updateRoomLastMessage } = useChatCache()

  // Hooks
  const { data: designRequests, isLoading } = useDesignerTasks()
  const createRoomMutation = useCreateRoom()
  const { data: rooms } = useMyRooms()
  const updateTaskStatusMutation = useUpdateTaskStatus()

  // Chat messages hook
  const { data: chatMessages, isLoading: isLoadingMessages } = useRoomMessages(chatRoomId || '', 20, 1)

  // Filter and process data
  const processedRequests = useMemo(() => {
    if (!designRequests) {
      return []
    }
    const requestsArray = designRequests.data?.data || []

    if (!Array.isArray(requestsArray)) {
      return []
    }

    return requestsArray as ExtendedOrderTaskItem[]
  }, [designRequests])

  // Helper functions
  const getTaskStatus = (milestones: ExtendedOrderTaskItem['milestones'], orderStatus?: string) => {
    // Nếu có orderStatus từ API, sử dụng nó
    if (orderStatus) {
      switch (orderStatus) {
        case 'COMPLETED':
          return 'COMPLETED'
        case 'IN_PROGRESS':
          return 'IN_PROGRESS'
        case 'PENDING':
          return 'PENDING'
        default:
          break
      }
    }

    // Fallback về logic cũ nếu không có orderStatus
    if (!milestones || milestones.length === 0) return 'PENDING'

    const allTasks = milestones.flatMap((m) => m.maternityDressTasks)
    if (allTasks.every((task) => task.status === 'COMPLETED')) return 'COMPLETED'
    if (allTasks.some((task) => task.status === 'IN_PROGRESS')) return 'IN_PROGRESS'
    return 'PENDING'
  }

  // Filter and process data
  const filteredRequests = useMemo(() => {
    let filtered = processedRequests

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.orderItem.designRequest.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.orderItem.designRequest.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => getTaskStatus(request.milestones, request.orderStatus) === statusFilter)
    }

    return filtered
  }, [processedRequests, searchTerm, statusFilter])

  // Pagination logic
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredRequests.slice(startIndex, endIndex)
  }, [filteredRequests, currentPage, pageSize])

  const totalPages = Math.ceil(filteredRequests.length / pageSize)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  useEffect(() => {
    let isMounted = true

    const setupChatConnection = async () => {
      if (!user?.userId) return

      try {
        await chatService.connect()

        if (!isMounted) return
      } catch (error) {
        console.error('❌ Failed to connect SignalR:', error)
      }
    }

    setupChatConnection()

    return () => {
      isMounted = false
    }
  }, [user?.userId])

  // Effect để xử lý chat room và messages
  useEffect(() => {
    if (!chatRoomId || !user?.userId) {
      return
    }

    // Handle new message from SignalR
    const handleNewMessage = (...args: unknown[]) => {
      const message = args[0] as ApiChatMessage

      if (message.chatRoomId === chatRoomId) {
        // Update room last message
        updateRoomLastMessage(chatRoomId, message.message, message.senderId, message.senderName)

        // Invalidate messages để refetch
        invalidateRoomMessages(chatRoomId)

        // Hiển thị toast nếu tin nhắn không phải từ user hiện tại
        if (message.senderId !== user.userId) {
          const messageTypeNumber = Number(message.type)
          const toastMessage = messageTypeNumber === 4 ? 'Preset thiết kế mới' : `Tin nhắn mới từ ${message.senderName}`

          toast.success(toastMessage, {
            description:
              messageTypeNumber === 4
                ? 'Designer đã gửi preset cho bạn'
                : message.message.length > 50
                  ? message.message.substring(0, 50) + '...'
                  : message.message
          })
        }
      }
    }

    const handleMessageSent = () => {
      // Refetch messages để đảm bảo sync
      invalidateRoomMessages(chatRoomId)
    }

    // Register listeners
    chatService.on('ReceiveMessage', handleNewMessage)
    chatService.on('MessageSent', handleMessageSent)

    return () => {
      chatService.off('ReceiveMessage', handleNewMessage)
      chatService.off('MessageSent', handleMessageSent)
    }
  }, [chatRoomId, user?.userId, invalidateRoomMessages, updateRoomLastMessage])

  // Convert API messages to component messages
  const convertedMessages: ChatMessage[] = useMemo(() => {
    return (chatMessages || []).map((msg: ApiChatMessage) => ({
      id: msg.id,
      message: msg.message,
      senderId: msg.senderId,
      senderName: msg.senderName,
      timestamp: msg.messageTimestamp?.toString() || new Date().toISOString(),
      chatRoomId: msg.chatRoomId,
      type: msg.type?.toString() || '0',
      isOwnMessage: msg.senderId === user?.userId
    }))
  }, [chatMessages, user?.userId])

  // Event handlers
  const handleViewDetail = (request: ExtendedOrderTaskItem) => {
    setSelectedRequest(request)
  }

  const handleStartChat = async (request: ExtendedOrderTaskItem) => {
    try {
      setActiveChatRequest(request)
      setIsChatPanelOpen(true)
      setIsChatMinimized(false)

      // Find existing room or create new one
      const existingRoom = rooms?.find((room) =>
        room.members?.some((member) => member.memberId === request.orderItem.designRequest.userId)
      )

      if (existingRoom) {
        setChatRoomId(existingRoom.id)
      } else {
        const newRoom = await createRoomMutation.mutateAsync({
          userId1: user?.userId || '',
          userId2: request.orderItem.designRequest.userId
        })
        setChatRoomId(newRoom.id)
      }
    } catch (error) {
      console.error('❌ Failed to start chat:', error)
      toast.error('Không thể bắt đầu chat')
    }
  }

  const handleQuickStart = (request: ExtendedOrderTaskItem) => {
    setQuickStartRequest(request)
    setIsQuickStartOpen(true)
  }

  const handleComplete = (request: ExtendedOrderTaskItem) => {
    setCompleteRequest(request)
    setIsCompleteDialogOpen(true)
  }

  const handleQuickStartConfirm = async () => {
    if (!quickStartRequest) return

    try {
      // Update task status to IN_PROGRESS
      await updateTaskStatusMutation.mutateAsync({
        taskId: quickStartRequest.milestones?.[0]?.maternityDressTasks?.[0]?.id || '',
        orderItemId: quickStartRequest.orderItem.id,
        body: {
          status: 'IN_PROGRESS'
        }
      })

      toast.success('Đã bắt đầu thiết kế')
      setIsQuickStartOpen(false)
      setQuickStartRequest(null)
    } catch (error) {
      console.error('Failed to start design:', error)
      toast.error('Không thể bắt đầu thiết kế')
    }
  }

  const handleCompleteConfirm = async () => {
    if (!completeRequest || !completeNote.trim() || !completeImage) return

    try {
      // Update task status to COMPLETED
      await updateTaskStatusMutation.mutateAsync({
        taskId: completeRequest.milestones?.[0]?.maternityDressTasks?.[0]?.id || '',
        orderItemId: completeRequest.orderItem.id,
        body: {
          status: 'DONE',
          note: completeNote,
          image: completeImage
        }
      })

      toast.success('Đã hoàn thành thiết kế')
      setIsCompleteDialogOpen(false)
      setCompleteRequest(null)
      setCompleteNote('')
      setCompleteImage('')
    } catch (error) {
      console.error('Failed to complete design:', error)
      toast.error('Không thể hoàn thành thiết kế')
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!chatRoomId || !message.trim()) {
      console.error('❌ Cannot send message:', { chatRoomId, message })
      toast.error('Không thể gửi tin nhắn: thiếu thông tin')
      return
    }

    try {
      // Check if SignalR is connected
      if (!chatService.isConnected) {
        await chatService.connect()
      }

      await chatService.sendMessage(chatRoomId, message)
      setNewMessage('')
    } catch (error) {
      console.error('❌ Failed to send message:', error)
      toast.error('Không thể gửi tin nhắn: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
    }
  }

  const handleSendPreset = () => {
    if (activeChatRequest) {
      setIsPresetDialogOpen(true)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center space-y-4'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
            </div>
            <div>
              <p className='text-lg font-medium text-foreground'>Đang tải yêu cầu thiết kế...</p>
              <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main className='space-y-6'>
      {/* Header */}
      <DesignRequestHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Stats */}
      <DesignRequestStats designRequests={filteredRequests} />

      {/* Content */}
      <div className='space-y-6'>
        <DesignRequestGrid
          requests={paginatedRequests}
          onViewDetail={handleViewDetail}
          onStartChat={handleStartChat}
          onQuickStart={handleQuickStart}
          onComplete={handleComplete}
        />

        {/* Pagination */}
        {filteredRequests.length > 0 && (
          <div className='flex flex-col items-center space-y-4'>
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={`cursor-pointer select-none ${
                      currentPage <= 1 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => handlePageChange(page)}
                      className='cursor-pointer'
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={`cursor-pointer select-none ${
                      currentPage >= totalPages ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>

            {/* Pagination Info */}
            <div className='text-center'>
              <span className='text-sm text-gray-600 dark:text-gray-300'>
                Trang {currentPage} / {totalPages} • Hiển thị {paginatedRequests.length} / {filteredRequests.length} yêu
                cầu
              </span>
            </div>

            {/* Page Size Selector */}
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600 dark:text-gray-300'>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className='px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className='text-sm text-gray-600 dark:text-gray-300'>yêu cầu/trang</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
        activeRequest={activeChatRequest}
        onSendMessage={handleSendMessage}
        messages={convertedMessages}
        isLoadingMessages={isLoadingMessages}
        newMessage={newMessage}
        onNewMessageChange={setNewMessage}
        isMinimized={isChatMinimized}
        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
        onSendPreset={handleSendPreset}
      />

      {/* Quick Start Dialog */}
      <QuickStartDialog
        isOpen={isQuickStartOpen}
        onClose={() => setIsQuickStartOpen(false)}
        request={quickStartRequest}
        onConfirm={handleQuickStartConfirm}
      />

      {/* Complete Design Dialog */}
      <CompleteDesignDialog
        isOpen={isCompleteDialogOpen}
        onClose={() => setIsCompleteDialogOpen(false)}
        request={completeRequest}
        note={completeNote}
        onNoteChange={setCompleteNote}
        image={completeImage}
        onImageChange={setCompleteImage}
        onConfirm={handleCompleteConfirm}
      />

      {/* Design Request Detail Dialog */}
      {selectedRequest && (
        <DesignRequestDetailDialog
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          designRequest={selectedRequest}
        />
      )}
      <SendPresetInChat
        isOpen={isPresetDialogOpen}
        onClose={() => setIsPresetDialogOpen(false)}
        designRequestId={activeChatRequest?.orderItem.designRequest.id || ''}
        orderCode={activeChatRequest?.orderCode || ''}
        roomId={chatRoomId}
        orderId={activeChatRequest?.orderItem.orderId || ''}
      />
    </Main>
  )
}

export default ManageDesignRequestPage
