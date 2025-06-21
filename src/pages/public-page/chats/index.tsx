import { useState, useEffect } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import { cn } from '@/lib/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { NewChat } from './components/new-chat'
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

  const { user } = useAuthStore()

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
    
  } = useChat()

  // Auto-load rooms when SignalR is connected (only once)
  useEffect(() => {
    if (isConnected && rooms.length === 0 && !isLoadingRooms) {
      console.log('🔄 Auto-loading rooms since SignalR is connected...')
      loadRooms()
    }
  }, [isConnected]) // Only depend on isConnected to avoid multiple loads

  // Filter rooms based on search
  const filteredRooms = rooms.filter((room) => {
    const roomName = room.name || `Room ${room.id}`
    return roomName.toLowerCase().includes(search.trim().toLowerCase())
  })

  // Get selected room details
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId)
  const selectedRoomMessages = selectedRoom ? realMessages[selectedRoom.id] || [] : []

  // Group messages by date for display
  const currentMessage = selectedRoomMessages.reduce((acc: Record<string, Convo[]>, obj) => {
    const key = format(obj.timestamp, 'd MMM, yyyy')

    if (!acc[key]) {
      acc[key] = []
    }

    acc[key].push(obj)
    return acc
  }, {})

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
    // If room has member info, show the other member's name
    if (room.members && room.members.length > 0) {
      const otherMember = room.members.find((member: Member) => member.memberId !== user?.userId)
      if (otherMember) {
        return {
          name: otherMember.memberName || otherMember.userName || 'Unknown User',
          avatar: otherMember.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherMember.memberName}`,
          initials: otherMember.memberName?.slice(0, 2).toUpperCase() || 'UN'
        }
      }
    }

    // Fallback to room name or ID
    return {
      name: room.name || `Room ${room.id}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${room.id}`,
      initials: room.name?.slice(0, 2).toUpperCase() || room.id.slice(-2).toUpperCase()
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
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                >
                  <EditIcon size={24} className='stroke-muted-foreground' />
                </Button>
              </div>

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
                <div className='flex items-center justify-center py-8'>
                  <div className='text-sm text-muted-foreground'>Loading rooms...</div>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 space-y-2'>
                  <div className='text-sm text-muted-foreground text-center'>
                    {isConnected ? (
                      rooms.length === 0 ? (
                        <>
                          <p>Chưa có phòng chat nào</p>
                          <p className='text-xs mt-1'>Bạn chưa tham gia cuộc trò chuyện nào</p>
                        </>
                      ) : (
                        'Không tìm thấy phòng chat phù hợp'
                      )
                    ) : (
                      'Đang kết nối để tải danh sách chat...'
                    )}
                  </div>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const roomInfo = getRoomDisplayInfo(room)
                  const lastMessage = realMessages[room.id]?.[0]
                  const lastMsg = lastMessage
                    ? lastMessage.sender === 'You'
                      ? `You: ${lastMessage.message}`
                      : lastMessage.message
                    : 'No messages yet'

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
                        <div className='flex gap-2'>
                          <Avatar>
                            <AvatarImage src={roomInfo.avatar} alt={roomInfo.initials} />
                            <AvatarFallback>{roomInfo.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className='col-start-2 row-span-2 font-medium'>{roomInfo.name}</span>
                            <span className='text-muted-foreground col-start-2 row-span-2 row-start-2 line-clamp-2 text-ellipsis'>
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
                    {(() => {
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
        <NewChat users={[]} onOpenChange={setCreateConversationDialog} open={createConversationDialogOpened} />
      </Main>
    </>
  )
}
