import { useState, useEffect, useMemo } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { NewChat } from './components/new-chat'
import { NotificationSettings } from './components/notification-settings'
import { type Convo } from './data/chat-types'
import { useChat } from './hooks/use-chat'
import { useAuthStore } from '@/lib/zustand/use-auth-store'
import { ChatRoom, Member } from '@/@types/chat.types'
import {
  ArrowLeftIcon,
  EditIcon,
  ImagePlusIcon,
  MessageCircle,
  MoreVerticalIcon,
  PaperclipIcon,
  PhoneIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  VideoIcon
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

  // Use the chat hook for SignalR functionality
  const {
    isConnected,
    sendMessage,
    loadMessages,
    loadRooms,
    joinRoom,
    rooms,
    messages: realMessages,
    isLoading,
    isLoadingRooms,
    error
  } = useChat()

  // Auto-load rooms when SignalR is connected (only once with better conditions)
  useEffect(() => {
    // More restrictive conditions to prevent duplicate calls
    const shouldAutoLoad = isConnected && rooms.length === 0 && !isLoadingRooms && !error // Don't auto-load if there's an error

    if (shouldAutoLoad) {
      console.log('🔄 Auto-loading rooms since SignalR is connected and no rooms exist...')
      loadRooms().catch((err) => {
        console.error('❌ Auto-load rooms failed:', err)
      })
    }
  }, [isConnected, rooms.length, isLoadingRooms, error, loadRooms]) // Include loadRooms since it's memoized

  // Auto-mark currently selected room as viewed when new messages arrive
  useEffect(() => {
    if (selectedRoomId) {
      setViewedRooms((prev) => new Set([...prev, selectedRoomId]))
    }
  }, [realMessages, selectedRoomId])

  // Memoize filtered rooms to prevent unnecessary recalculations
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // First filter: ensure room has valid ID and basic properties
        if (!room || !room.id || typeof room.id !== 'string' || room.id.trim() === '') {
          console.warn('⚠️ Filtering out invalid room in UI:', room)
          return false
        }
        return true
      })
      .filter((room) => {
        // Second filter: search functionality
        const roomName = room.name || `Room ${room.id}`
        const searchTerm = search.trim().toLowerCase()

        if (!searchTerm) return true // Show all if no search term

        return roomName.toLowerCase().includes(searchTerm)
      })
  }, [rooms, search]) // Only recalculate when rooms or search changes

  // Memoize selected room and messages
  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId), [rooms, selectedRoomId])

  const selectedRoomMessages = useMemo(
    () => (selectedRoom ? realMessages[selectedRoom.id] || [] : []),
    [selectedRoom, realMessages]
  )

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
  const handleRefreshRooms = async () => {
    if (!isConnected) {
      console.log('❌ Cannot refresh rooms: Not connected to SignalR')
      return
    }

    try {
      console.log('🔄 Manually refreshing rooms...')
      await loadRooms()
      console.log('✅ Rooms refreshed successfully')
    } catch (err) {
      console.error('❌ Failed to refresh rooms:', err)
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

      // Load messages for the room
      await loadMessages(roomId)

      console.log('✅ Successfully selected and loaded newly created room')
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

      // First join the room (if not already joined)
      await joinRoom(roomId)

      // Then load messages
      await loadMessages(roomId)
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
      // Show unread indicator if:
      // 1. There is a last message
      // 2. Last message is not from current user
      // 3. Room hasn't been viewed yet
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

  return (
    <>
      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <MessageCircle size={20} />
                  {/* Connection Status Indicator */}
                  <div className='flex items-center'>
                    <div
                      className={cn('h-2 w-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')}
                      title={isConnected ? 'Connected to chat server' : 'Disconnected from chat server'}
                    />
                    <span className='ml-1 text-xs text-muted-foreground'>{isConnected ? 'Online' : 'Offline'}</span>
                  </div>
                </div>

                <div className='flex gap-1'>
                  <NotificationSettings />
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={handleRefreshRooms}
                    disabled={!isConnected || isLoadingRooms}
                    className='rounded-lg'
                    title='Refresh rooms'
                  >
                    <RefreshCwIcon
                      size={20}
                      className={cn('stroke-muted-foreground', isLoadingRooms && 'animate-spin')}
                    />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={() => setCreateConversationDialog(true)}
                    className='rounded-lg'
                  >
                    <EditIcon size={24} className='stroke-muted-foreground' />
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className='mb-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
                  <div className='flex items-center justify-between'>
                    <span>⚠️ {error}</span>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={handleRefreshRooms}
                      disabled={!isConnected}
                      className='h-6 px-2 text-xs'
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              <label className='border-input focus-within:ring-ring flex h-12 w-full items-center space-x-0 rounded-md border pl-2 focus-within:ring-1 focus-within:outline-hidden'>
                <SearchIcon size={15} className='mr-2 stroke-slate-500' />
                <span className='sr-only'>Search</span>
                <input
                  type='text'
                  className='w-full flex-1 bg-inherit text-sm focus-visible:outline-hidden'
                  placeholder='Search chat...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </div>

            <ScrollArea className='-mx-3 h-full p-3'>
              {isLoadingRooms ? (
                <div className='flex flex-col items-center justify-center py-8 space-y-3'>
                  <RefreshCwIcon className='h-8 w-8 animate-spin text-muted-foreground' />
                  <div className='text-sm text-muted-foreground text-center'>
                    <p>Loading rooms via SignalR...</p>
                    <p className='text-xs mt-1'>Getting your chat rooms in real-time</p>
                  </div>
                </div>
              ) : !isConnected ? (
                <div className='flex flex-col items-center justify-center py-8 space-y-3'>
                  <div className='h-8 w-8 rounded-full bg-red-100 flex items-center justify-center'>
                    <div className='h-3 w-3 rounded-full bg-red-500'></div>
                  </div>
                  <div className='text-sm text-muted-foreground text-center'>
                    <p>Disconnected from chat server</p>
                    <p className='text-xs mt-1'>Connecting to load your rooms...</p>
                  </div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 space-y-2'>
                  <div className='text-sm text-muted-foreground text-center'>
                    {rooms.length === 0 ? (
                      <>
                        <MessageCircle className='h-12 w-12 mx-auto mb-3 text-muted-foreground' />
                        <p>Chưa có phòng chat nào</p>
                        <p className='text-xs mt-1'>Bạn chưa tham gia cuộc trò chuyện nào</p>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setCreateConversationDialog(true)}
                          className='mt-3'
                        >
                          <PlusIcon className='h-4 w-4 mr-2' />
                          Tạo chat mới
                        </Button>
                      </>
                    ) : (
                      <>
                        <SearchIcon className='h-8 w-8 mx-auto mb-2 text-muted-foreground' />
                        <p>Không tìm thấy phòng chat phù hợp</p>
                        <p className='text-xs mt-1'>Thử tìm kiếm từ khóa khác</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const roomInfo = getRoomDisplayInfo(room)
                  const lastMsg = roomInfo.lastMessage

                  return (
                    <Fragment key={room.id}>
                      <button
                        type='button'
                        className={cn(
                          'hover:bg-secondary/75 -mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm',
                          selectedRoomId === room.id && 'sm:bg-muted'
                        )}
                        onClick={() => handleSelectRoom(room.id)}
                      >
                        <div className='flex gap-2 w-full'>
                          <Avatar>
                            <AvatarImage src={roomInfo.avatar} alt={roomInfo.initials} />
                            <AvatarFallback>{roomInfo.initials}</AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <div className='flex justify-between items-start'>
                              <span
                                className={cn('truncate', roomInfo.hasUnreadMessage ? 'font-semibold' : 'font-medium')}
                              >
                                {roomInfo.name}
                              </span>
                              <div className='flex items-center gap-1 flex-shrink-0 ml-2'>
                                <span className='text-xs text-muted-foreground'>
                                  {formatSmartTimestamp(room.lastTimestamp || '')}
                                </span>
                                {roomInfo.hasUnreadMessage && <div className='w-2 h-2 bg-blue-500 rounded-full'></div>}
                              </div>
                            </div>
                            <span
                              className={cn(
                                'text-sm line-clamp-1 text-ellipsis',
                                roomInfo.hasUnreadMessage ? 'text-foreground font-medium' : 'text-muted-foreground'
                              )}
                            >
                              {lastMsg}
                            </span>
                          </div>
                        </div>
                      </button>
                      <Separator className='my-1' />
                    </Fragment>
                  )
                })
              )}
            </ScrollArea>
          </div>

          {/* Right Side */}
          {selectedRoom ? (
            <div
              className={cn(
                'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex',
                mobileSelectedUser && 'left-0 flex'
              )}
            >
              {/* Top Part */}
              <div className='bg-secondary mb-1 flex flex-none justify-between rounded-t-md p-4 shadow-lg'>
                {/* Left */}
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ml-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedUser(false)}
                  >
                    <ArrowLeftIcon />
                  </Button>
                  <div className='flex items-center gap-2 lg:gap-4'>
                    {selectedRoom &&
                      (() => {
                        const roomInfo = getRoomDisplayInfo(selectedRoom)
                        return (
                          <>
                            <Avatar className='size-9 lg:size-11'>
                              <AvatarImage src={roomInfo.avatar} alt={roomInfo.initials} />
                              <AvatarFallback>{roomInfo.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className='col-start-2 row-span-2 text-sm font-medium lg:text-base'>
                                {roomInfo.name}
                              </span>
                              <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-1 block max-w-32 text-xs text-nowrap text-ellipsis lg:max-w-none lg:text-sm'>
                                {isConnected ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </>
                        )
                      })()}
                  </div>
                </div>

                {/* Right */}
                <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                  <Button
                    onClick={() => loadMessages(selectedRoomId)}
                    disabled={!isConnected || isLoading}
                    size='sm'
                    variant='ghost'
                  >
                    {isLoading ? '⏳' : '🔄'} Reload
                  </Button>
                  <Button size='icon' variant='ghost' className='hidden size-8 rounded-full sm:inline-flex lg:size-10'>
                    <VideoIcon size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button size='icon' variant='ghost' className='hidden size-8 rounded-full sm:inline-flex lg:size-10'>
                    <PhoneIcon size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button size='icon' variant='ghost' className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'>
                    <MoreVerticalIcon className='stroke-muted-foreground sm:size-5' />
                  </Button>
                </div>
              </div>

              {/* Conversation */}
              <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                <div className='flex size-full flex-1'>
                  <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                    <div className='chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pr-4 pb-4'>
                      {Object.keys(currentMessage).length === 0 ? (
                        <div className='flex items-center justify-center py-8'>
                          <div className='text-sm text-muted-foreground'>
                            {isLoading ? 'Loading messages...' : 'No messages yet. Start the conversation!'}
                          </div>
                        </div>
                      ) : (
                        Object.keys(currentMessage).map((key) => (
                          <Fragment key={key}>
                            {currentMessage[key].map((msg, index) => (
                              <div
                                key={`${msg.sender}-${msg.timestamp}-${index}`}
                                className={cn(
                                  'chat-box max-w-72 px-3 py-2 break-words shadow-lg',
                                  msg.sender === 'You'
                                    ? 'bg-primary/85 text-primary-foreground/75 self-end rounded-[16px_16px_0_16px]'
                                    : 'bg-secondary self-start rounded-[16px_16px_16px_0]'
                                )}
                              >
                                {msg.message}{' '}
                                <span
                                  className={cn(
                                    'text-muted-foreground mt-1 block text-xs font-light italic',
                                    msg.sender === 'You' && 'text-right'
                                  )}
                                >
                                  {format(msg.timestamp, 'h:mm a')}
                                </span>
                              </div>
                            ))}
                            <div className='text-center text-xs'>{key}</div>
                          </Fragment>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <form className='flex w-full flex-none gap-2' onSubmit={handleSendMessage}>
                  <div className='border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4'>
                    <div className='space-x-1'>
                      <Button size='icon' type='button' variant='ghost' className='h-8 rounded-md'>
                        <PlusIcon size={20} className='stroke-muted-foreground' />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <ImagePlusIcon size={20} className='stroke-muted-foreground' />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <PaperclipIcon size={20} className='stroke-muted-foreground' />
                      </Button>
                    </div>
                    <label className='flex-1'>
                      <span className='sr-only'>Chat Text Box</span>
                      <input
                        type='text'
                        placeholder='Type your messages...'
                        className='h-8 w-full bg-inherit focus-visible:outline-hidden'
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={!isConnected}
                      />
                    </label>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hidden sm:inline-flex'
                      type='submit'
                      disabled={!isConnected || !newMessage.trim()}
                    >
                      <SendIcon size={20} />
                    </Button>
                  </div>
                  <Button className='h-full sm:hidden' type='submit' disabled={!isConnected || !newMessage.trim()}>
                    <SendIcon size={18} /> Send
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col justify-center rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex'
              )}
            >
              <div className='flex flex-col items-center space-y-6'>
                <div className='border-border flex size-16 items-center justify-center rounded-full border-2'>
                  <MessageCircle className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Your messages</h1>
                  <p className='text-muted-foreground text-sm'>
                    {isConnected ? 'Select a room to start chatting.' : 'Connect to SignalR to start chatting.'}
                  </p>
                </div>
                <Button
                  className='bg-blue-500 px-6 text-white hover:bg-blue-600'
                  onClick={() => setCreateConversationDialog(true)}
                  disabled={!isConnected}
                >
                  {isConnected ? 'Create Chat' : 'Connect First'}
                </Button>
              </div>
            </div>
          )}
        </section>
        <NewChat
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
          onRoomCreated={handleRoomCreated}
        />
      </Main>
    </>
  )
}
