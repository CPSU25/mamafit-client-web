import { useState, useEffect, useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Main } from '@/components/layout/main'
import { NewChat } from './components/new-chat'
import { NotificationSettings } from './components/notification-settings'
import { type Convo } from './data/chat-types'
import { useChat } from './hooks/use-chat'
import { useRoomMessagesData } from './hooks/use-room-messages'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { ChatRoom, Member } from '@/@types/chat.types'
import {
  ArrowLeftIcon,
  MessageCircle,
  MoreVerticalIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  VideoIcon,
  AlertTriangle
} from 'lucide-react'

export default function Chats() {
  const [search, setSearch] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  const [mobileSelectedUser, setMobileSelectedUser] = useState<boolean>(false)
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [viewedRooms, setViewedRooms] = useState<Set<string>>(new Set()) // Track viewed rooms

  const { user } = useAuthStore()

  // Helper function to format timestamp smartly (memoized)
  const formatSmartTimestamp = useMemo(
    () => (timestamp: string | Date) => {
      if (!timestamp) return ''

      const date = new Date(timestamp)

      if (isToday(date)) {
        return format(date, 'HH:mm')
      } else if (isYesterday(date)) {
        return 'Hôm qua'
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE') // Tên thứ
      } else {
        return format(date, 'dd/MM')
      }
    },
    []
  )

  // ===== MAIN CHAT HOOK =====
  const {
    isConnected,
    sendMessage,
    joinRoom,
    rooms,
    messages: realTimeMessages, // Realtime messages từ SignalR
    isLoading: isCreatingRoom,
    isLoadingRooms,
    error: chatError,
    loadRooms
  } = useChat()

  // ===== ROOM MESSAGES HOOK =====
  // Load messages cho room hiện tại
  const {
    messages: selectedRoomMessages,
    isLoading: isLoadingMessages,
    error: messagesError,
    refetch: refetchMessages
  } = useRoomMessagesData({
    roomId: selectedRoomId,
    realtimeMessages: realTimeMessages,
    pageSize: 20,
    page: 1
  })

  // Auto-load rooms when SignalR is connected
  useEffect(() => {
    const shouldAutoLoad = isConnected && rooms.length === 0 && !isLoadingRooms && !chatError

    if (shouldAutoLoad) {
      console.log('🔄 Auto-loading rooms since SignalR is connected and no rooms exist...')
      loadRooms()
    }
  }, [isConnected, rooms.length, isLoadingRooms, chatError, loadRooms])

  // Auto-mark currently selected room as viewed when new messages arrive
  useEffect(() => {
    if (selectedRoomId) {
      setViewedRooms((prev) => new Set([...prev, selectedRoomId]))
    }
  }, [realTimeMessages, selectedRoomId])

  // Memoize filtered rooms to prevent unnecessary recalculations
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        if (!room || !room.id || typeof room.id !== 'string' || room.id.trim() === '') {
          console.warn('⚠️ Filtering out invalid room in UI:', room)
          return false
        }
        return true
      })
      .filter((room) => {
        const roomName = room.name || `Room ${room.id}`
        const searchTerm = search.trim().toLowerCase()

        if (!searchTerm) return true
        return roomName.toLowerCase().includes(searchTerm)
      })
  }, [rooms, search])

  // Memoize selected room
  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId), [rooms, selectedRoomId])

  // Memoize grouped messages by date
  const currentMessage = useMemo(() => {
    return selectedRoomMessages.reduce((acc: Record<string, Convo[]>, obj) => {
      const key = format(obj.timestamp, 'd MMM, yyyy')

      if (!acc[key]) {
        acc[key] = []
      }

      acc[key].push(obj)
      return acc
    }, {})
  }, [selectedRoomMessages])

  // Handle manual refresh of rooms
  const handleRefreshRooms = () => {
    if (!isConnected) {
      console.log('❌ Cannot refresh rooms: Not connected to SignalR')
      return
    }

    console.log('🔄 Manually refreshing rooms...')
    loadRooms()
    console.log('✅ Rooms refreshed successfully')
  }

  // Handle manual refresh of messages
  const handleRefreshMessages = async () => {
    if (!selectedRoomId || !isConnected) {
      console.log('❌ Cannot refresh messages: No room selected or not connected')
      return
    }

    try {
      console.log('🔄 Manually refreshing messages...')
      await refetchMessages()
      console.log('✅ Messages refreshed successfully')
    } catch (err) {
      console.error('❌ Failed to refresh messages:', err)
    }
  }

  // Handle when a new room is created - auto-select and show chat
  const handleRoomCreated = async (roomId: string) => {
    try {
      console.log('🏠 Handling newly created room:', roomId)

      // Auto-select the room
      setSelectedRoomId(roomId)
      setMobileSelectedUser(true) // Show chat on mobile

      // Mark room as viewed
      setViewedRooms((prev) => new Set([...prev, roomId]))

      // Join the room if not already joined
      await joinRoom(roomId)

      console.log('✅ Successfully selected newly created room')
    } catch (err) {
      console.error('❌ Failed to auto-select newly created room:', err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedRoomId) return

    try {
      await sendMessage(selectedRoomId, newMessage.trim())
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const handleSelectRoom = async (roomId: string) => {
    try {
      setSelectedRoomId(roomId)
      setMobileSelectedUser(true)

      // Mark room as viewed (remove unread indicator)
      setViewedRooms((prev) => new Set([...prev, roomId]))

      // Join the room (SignalR)
      await joinRoom(roomId)

      // Messages will be loaded automatically by React Query hook
    } catch (err) {
      console.error('Failed to select room:', err)
    }
  }

  // Get room display name and info
  const getRoomDisplayInfo = (room: ChatRoom) => {
    // Safety check for room object
    if (!room || !room.id) {
      console.warn('⚠️ Invalid room object:', room)
      return {
        name: 'Unknown Room',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Unknown',
        initials: 'UR',
        lastMessage: 'No messages yet',
        lastMessageTimestamp: new Date(),
        lastUserName: '',
        isLastMessageFromCurrentUser: false,
        hasUnreadMessage: false
      }
    }

    // Format last message with sender info
    const formatLastMessage = () => {
      if (!room.lastMessage || typeof room.lastMessage !== 'string') return 'No messages yet'

      const isCurrentUser = room.lastUserId === user?.userId
      const senderName = isCurrentUser ? 'You' : room.lastUserName || 'Someone'

      return `${senderName}: ${room.lastMessage}`
    }

    // Format timestamp
    const formatTimestamp = () => {
      if (!room.lastTimestamp) return new Date()
      const timestamp = new Date(room.lastTimestamp)
      return isNaN(timestamp.getTime()) ? new Date() : timestamp
    }

    // Check if room has unread messages
    const hasUnreadMessage = () => {
      return Boolean(room.lastMessage && room.lastUserId !== user?.userId && !viewedRooms.has(room.id))
    }

    // If room has member info, show the other member's name
    if (room.members && Array.isArray(room.members) && room.members.length > 0) {
      const otherMember = room.members.find(
        (member: Member) => member && member.memberId && member.memberId !== user?.userId
      )

      if (otherMember && otherMember.memberName) {
        const memberName = otherMember.memberName || otherMember.userName || 'Unknown User'
        const safeName = typeof memberName === 'string' ? memberName : 'Unknown User'

        return {
          name: safeName,
          avatar: otherMember.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${safeName}`,
          initials: safeName.slice(0, 2).toUpperCase() || 'UN',
          lastMessage: formatLastMessage(),
          lastMessageTimestamp: formatTimestamp(),
          lastUserName: room.lastUserName || '',
          isLastMessageFromCurrentUser: room.lastUserId === user?.userId,
          hasUnreadMessage: hasUnreadMessage()
        }
      }
    }

    // Fallback to room name or ID
    const roomName = room.name || `Room ${room.id}`
    const safeName = typeof roomName === 'string' ? roomName : `Room ${room.id}`
    const safeId = typeof room.id === 'string' ? room.id : 'unknown'

    return {
      name: safeName,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${safeId}`,
      initials: safeName.slice(0, 2).toUpperCase() || safeId.slice(-2).toUpperCase() || 'UR',
      lastMessage: formatLastMessage(),
      lastMessageTimestamp: formatTimestamp(),
      lastUserName: room.lastUserName || '',
      isLastMessageFromCurrentUser: room.lastUserId === user?.userId,
      hasUnreadMessage: hasUnreadMessage()
    }
  }

  // Combine errors
  const error = chatError || (messagesError instanceof Error ? messagesError.message : null)

  // Loading state
  if (isLoadingRooms && rooms.length === 0) {
    return (
      <Main>
        <div className='flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-2'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>Chat</h1>
                <p className='text-muted-foreground'>Communicate with your team members in real-time.</p>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]'>
            <Card className='lg:col-span-1'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <MessageCircle className='h-5 w-5' />
                    Conversations
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <Skeleton className='h-10 w-full' />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='flex items-center space-x-3'>
                      <Skeleton className='h-10 w-10 rounded-full' />
                      <div className='space-y-2 flex-1'>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-3 w-3/4' />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='lg:col-span-2'>
              <CardContent className='flex items-center justify-center h-full'>
                <div className='flex flex-col items-center space-y-3'>
                  <RefreshCwIcon className='h-8 w-8 animate-spin text-muted-foreground' />
                  <div className='text-sm text-muted-foreground text-center'>
                    <p>Loading conversations...</p>
                    <p className='text-xs mt-1'>Getting your chat rooms in real-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
    )
  }

  // Error state
  if (error) {
    return (
      <Main>
        <div className='flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-2'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>Chat</h1>
                <p className='text-muted-foreground'>Communicate with your team members in real-time.</p>
              </div>
            </div>
          </div>

          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription className='flex items-center justify-between'>
              <span>⚠️ {error}</span>
              <Button size='sm' variant='outline' onClick={handleRefreshRooms} disabled={!isConnected} className='ml-4'>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='flex flex-col gap-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-y-2'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>Chat</h1>
              <p className='text-muted-foreground'>Communicate with your team members in real-time.</p>
            </div>
            <div className='flex items-center gap-2'>
              <Badge variant={isConnected ? 'default' : 'destructive'} className='gap-1'>
                <div className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
                {isConnected ? 'Online' : 'Offline'}
              </Badge>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCreateConversationDialog(true)}
                disabled={!isConnected}
              >
                <PlusIcon className='h-4 w-4 mr-2' />
                New Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]'>
          {/* Left Side - Conversation List */}
          <Card className='lg:col-span-1'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <MessageCircle className='h-5 w-5' />
                  Conversations
                </CardTitle>
                <div className='flex gap-1'>
                  <NotificationSettings />
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={handleRefreshRooms}
                    disabled={!isConnected || isLoadingRooms}
                  >
                    <RefreshCwIcon className={cn('h-4 w-4', isLoadingRooms && 'animate-spin')} />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className='relative'>
                <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <input
                  type='text'
                  placeholder='Search conversations...'
                  className='w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent className='p-0'>
              <ScrollArea className='h-[400px]'>
                {!isConnected ? (
                  <div className='flex flex-col items-center justify-center py-8 px-4 space-y-3'>
                    <div className='h-8 w-8 rounded-full bg-red-100 flex items-center justify-center'>
                      <div className='h-3 w-3 rounded-full bg-red-500'></div>
                    </div>
                    <div className='text-sm text-muted-foreground text-center'>
                      <p>Disconnected from chat server</p>
                      <p className='text-xs mt-1'>Connecting to load your rooms...</p>
                    </div>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-8 px-4 space-y-3'>
                    <div className='text-sm text-muted-foreground text-center'>
                      {rooms.length === 0 ? (
                        <>
                          <MessageCircle className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                          <p>No conversations yet</p>
                          <p className='text-xs mt-1'>Start a new conversation to get started</p>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setCreateConversationDialog(true)}
                            className='mt-3'
                          >
                            <PlusIcon className='h-4 w-4 mr-2' />
                            Create New Chat
                          </Button>
                        </>
                      ) : (
                        <>
                          <SearchIcon className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                          <p>No conversations found</p>
                          <p className='text-xs mt-1'>Try searching with different keywords</p>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className='p-4 space-y-2'>
                    {filteredRooms.map((room) => {
                      const roomInfo = getRoomDisplayInfo(room)

                      return (
                        <button
                          key={room.id}
                          type='button'
                          className={cn(
                            'w-full p-3 rounded-lg text-left transition-colors hover:bg-muted/50',
                            selectedRoomId === room.id && 'bg-muted'
                          )}
                          onClick={() => handleSelectRoom(room.id)}
                        >
                          <div className='flex items-start gap-3'>
                            <Avatar className='h-10 w-10'>
                              <AvatarImage src={roomInfo.avatar} alt={roomInfo.initials} />
                              <AvatarFallback>{roomInfo.initials}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 min-w-0'>
                              <div className='flex justify-between items-start mb-1'>
                                <h4
                                  className={cn(
                                    'text-sm font-medium truncate',
                                    roomInfo.hasUnreadMessage && 'font-semibold'
                                  )}
                                >
                                  {roomInfo.name}
                                </h4>
                                <div className='flex items-center gap-1 flex-shrink-0'>
                                  <span className='text-xs text-muted-foreground'>
                                    {formatSmartTimestamp(room.lastTimestamp || '')}
                                  </span>
                                  {roomInfo.hasUnreadMessage && (
                                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                  )}
                                </div>
                              </div>
                              <p
                                className={cn(
                                  'text-xs truncate',
                                  roomInfo.hasUnreadMessage ? 'text-foreground font-medium' : 'text-muted-foreground'
                                )}
                              >
                                {roomInfo.lastMessage}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Side - Chat Area */}
          {selectedRoom ? (
            <Card
              className={cn(
                'lg:col-span-2',
                mobileSelectedUser ? 'fixed inset-0 z-50 lg:relative lg:z-auto' : 'hidden lg:flex lg:flex-col'
              )}
            >
              {/* Chat Header */}
              <CardHeader className='border-b'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='lg:hidden'
                      onClick={() => setMobileSelectedUser(false)}
                    >
                      <ArrowLeftIcon className='h-4 w-4' />
                    </Button>
                    {(() => {
                      const roomInfo = getRoomDisplayInfo(selectedRoom)
                      return (
                        <>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage src={roomInfo.avatar} alt={roomInfo.initials} />
                            <AvatarFallback>{roomInfo.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className='font-semibold'>{roomInfo.name}</h3>
                            <p className='text-sm text-muted-foreground'>{isConnected ? 'Online' : 'Offline'}</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={handleRefreshMessages}
                      disabled={!isConnected || isLoadingMessages}
                      size='sm'
                      variant='outline'
                    >
                      {isLoadingMessages ? (
                        <RefreshCwIcon className='h-4 w-4 animate-spin' />
                      ) : (
                        <RefreshCwIcon className='h-4 w-4' />
                      )}
                    </Button>
                    <Button size='sm' variant='ghost'>
                      <VideoIcon className='h-4 w-4' />
                    </Button>
                    <Button size='sm' variant='ghost'>
                      <PhoneIcon className='h-4 w-4' />
                    </Button>
                    <Button size='sm' variant='ghost'>
                      <MoreVerticalIcon className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className='flex-1 p-0'>
                <ScrollArea className='h-[400px] p-4'>
                  <div className='flex flex-col-reverse gap-4'>
                    {isLoadingMessages && selectedRoomMessages.length === 0 ? (
                      <div className='flex items-center justify-center py-8'>
                        <div className='text-sm text-muted-foreground text-center'>
                          <RefreshCwIcon className='h-6 w-6 animate-spin mx-auto mb-2' />
                          Loading messages...
                        </div>
                      </div>
                    ) : Object.keys(currentMessage).length === 0 ? (
                      <div className='flex items-center justify-center py-8'>
                        <div className='text-sm text-muted-foreground text-center'>
                          No messages yet. Start the conversation!
                        </div>
                      </div>
                    ) : (
                      Object.keys(currentMessage).map((key) => (
                        <Fragment key={key}>
                          {currentMessage[key].map((msg, index) => (
                            <div
                              key={`${msg.sender}-${msg.timestamp}-${index}`}
                              className={cn(
                                'max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm',
                                msg.sender === 'You'
                                  ? 'bg-primary text-primary-foreground self-end ml-auto'
                                  : 'bg-muted self-start mr-auto'
                              )}
                            >
                              <p className='text-sm'>{msg.message}</p>
                              <span
                                className={cn(
                                  'text-xs opacity-70 mt-1 block',
                                  msg.sender === 'You' ? 'text-right' : 'text-left'
                                )}
                              >
                                {format(msg.timestamp, 'h:mm a')}
                              </span>
                            </div>
                          ))}
                          <div className='text-center text-xs text-muted-foreground py-2'>{key}</div>
                        </Fragment>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className='border-t p-4'>
                <form onSubmit={handleSendMessage} className='flex gap-2'>
                  <div className='flex-1 flex items-center gap-2 border rounded-lg px-3 py-2'>
                    <Button size='sm' type='button' variant='ghost'>
                      <PlusIcon className='h-4 w-4' />
                    </Button>
                    <Button size='sm' type='button' variant='ghost'>
                      <PaperclipIcon className='h-4 w-4' />
                    </Button>
                    <input
                      type='text'
                      placeholder='Type your message...'
                      className='flex-1 bg-transparent border-none outline-none text-sm'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={!isConnected}
                    />
                  </div>
                  <Button type='submit' disabled={!isConnected || !newMessage.trim() || isCreatingRoom} size='sm'>
                    <SendIcon className='h-4 w-4' />
                  </Button>
                </form>
              </div>
            </Card>
          ) : (
            <Card className='lg:col-span-2 hidden lg:flex lg:flex-col'>
              <CardContent className='flex-1 flex items-center justify-center'>
                <div className='flex flex-col items-center space-y-6 text-center'>
                  <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center'>
                    <MessageCircle className='h-8 w-8 text-muted-foreground' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-xl font-semibold'>Your Messages</h3>
                    <p className='text-muted-foreground text-sm max-w-sm'>
                      {isConnected
                        ? 'Select a conversation to start chatting or create a new one.'
                        : 'Connect to the chat server to start messaging.'}
                    </p>
                  </div>
                  <Button onClick={() => setCreateConversationDialog(true)} disabled={!isConnected}>
                    {isConnected ? 'Start New Chat' : 'Connecting...'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <NewChat
        onOpenChange={setCreateConversationDialog}
        open={createConversationDialogOpened}
        onRoomCreated={handleRoomCreated}
      />
    </Main>
  )
}
