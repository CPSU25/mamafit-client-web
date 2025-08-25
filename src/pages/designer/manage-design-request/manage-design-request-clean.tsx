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

const ManageDesignRequestPage = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<ExtendedOrderTaskItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

    // API response structure: { data: [...], message: "...", statusCode: 200, code: "SUCCESS" }
    // So we need to access designRequests.data.data (nested data property)
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

  // Setup SignalR connection và real-time listeners
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
      setSelectedRequest(activeChatRequest)
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
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Stats */}
      <DesignRequestStats designRequests={filteredRequests} />

      {/* Content */}
      <div className='space-y-6'>
        {viewMode === 'grid' ? (
          <DesignRequestGrid
            requests={filteredRequests}
            onViewDetail={handleViewDetail}
            onStartChat={handleStartChat}
            onQuickStart={handleQuickStart}
            onComplete={handleComplete}
          />
        ) : (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>List view chưa được implement</p>
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
        designRequestId={selectedRequest?.orderItem.designRequest.id || ''}
        orderCode={selectedRequest?.orderCode || ''}
        roomId={chatRoomId}
        orderId={selectedRequest?.orderItem.orderId || ''}
      />
    </Main>
  )
}

export default ManageDesignRequestPage
