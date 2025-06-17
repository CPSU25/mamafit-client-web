import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { format } from 'date-fns'
import {
  ArrowLeft,
  DotSquare,
  Edit,
  MessagesSquare,
  Paperclip,
  Phone,
  PhoneOutgoing,
  Plus,
  Send,
  Video
} from 'lucide-react'
import { cn } from '@/lib/utils/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { NewChat } from './components/new-chat'
import { useChat } from '@/hooks/use-chat'
import { ChatRoom, ChatMessage } from '@/@types/chat.types'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

export default function Chats() {
  const [search, setSearch] = useState('')
  const [mobileSelectedUser, setMobileSelectedUser] = useState<ChatRoom | null>(null)
  const [createConversationDialogOpened, setCreateConversationDialog] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  // Use real chat data instead of fake data
  const {
    rooms,
    messages,
    activeRoom,
    onlineUsers,
    typingUsers,
    isConnected,
    isLoading,
    connectionError,
    isRetrying,
    selectRoom,
    sendMessage,
    startTyping,
    stopTyping,
    retryConnection
    // createRoom
  } = useChat()

  // Get current user from auth store
  const { user } = useAuthStore()

  // Helper function to get current user ID
  const getCurrentUserId = () => {
    return user?.id || ''
  }
  // Get other participant info for display
  const getOtherParticipant = (room: ChatRoom) => {
    // Safe check for members array
    if (!room?.members || !Array.isArray(room.members)) {
      return undefined
    }
    // Giả sử current user là userId, còn lại là đối phương
    return room.members.find((m) => m.memberId !== getCurrentUserId())
  }
  console.log(getOtherParticipant(rooms[0]))
  // Get last message for room list
  const getLastMessage = (roomId: string) => {
    const roomMessages = messages[roomId] || []
    return roomMessages[0] // Messages are ordered by timestamp desc
  }

  // Filtered data based on the search query
  const filteredChatList = rooms.filter((room) => {
    const otherParticipant = getOtherParticipant(room)
    return otherParticipant?.memberName?.toLowerCase().includes(search.trim().toLowerCase())
  })

  // Get current messages for active room
  const currentMessages = activeRoom ? messages[activeRoom.id] || [] : []

  // Group messages by date
  const groupedMessages = currentMessages.reduce((acc: Record<string, ChatMessage[]>, msg) => {
    const key = format(new Date(msg.timestamp), 'd MMM, yyyy')
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(msg)
    return acc
  }, {})

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim()) return

    try {
      await sendMessage(messageInput)
      setMessageInput('')
      await stopTyping()
    } catch (error) {
      console.error('Failed to send message:', error)
      // You might want to show an error toast here
    }
  }

  // Handle typing
  const handleTyping = async (value: string) => {
    setMessageInput(value)

    if (value.trim()) {
      await startTyping()
    } else {
      await stopTyping()
    }
  }

  // Get users for NewChat component
  const users = rooms.map((room) => getOtherParticipant(room)).filter(Boolean)

  if (isLoading) {
    return (
      <Main fixed>
        <div className='flex items-center justify-center h-full'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
            <p className='mt-2 text-muted-foreground'>Loading chats...</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <>
      {/* ===== Top Heading ===== */}
      {/* <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header> */}

      <Main fixed>
        <section className='flex h-full gap-6'>
          {/* Left Side */}
          <div className='flex w-full flex-col gap-2 sm:w-56 lg:w-72 2xl:w-80'>
            <div className='bg-background sticky top-0 z-10 -mx-4 px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
              <div className='flex items-center justify-between py-2'>
                <div className='flex gap-2 items-center'>
                  <h1 className='text-2xl font-bold'>Inbox</h1>
                  <MessagesSquare className='w-5 h-5' />
                  {!isConnected && (
                    <div
                      className='w-2 h-2 bg-red-500 rounded-full animate-pulse'
                      title={connectionError || 'Disconnected'}
                    />
                  )}
                  {isRetrying && (
                    <div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse' title='Reconnecting...' />
                  )}
                </div>

                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() => setCreateConversationDialog(true)}
                  className='rounded-lg'
                >
                  <Edit size={24} className='stroke-muted-foreground' />
                </Button>
              </div>

              <label className='border-input focus-within:ring-ring flex h-12 w-full items-center space-x-0 rounded-md border pl-2 focus-within:ring-1 focus-within:outline-hidden'>
                <Search className='mr-2 stroke-slate-500 w-4 h-4' />
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

            {/* Connection Error Banner */}
            {connectionError && !isRetrying && (
              <div className='mx-3 mb-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-red-800 font-medium'>Connection Error</p>
                    <p className='text-xs text-red-600 mt-1'>{connectionError}</p>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={retryConnection}
                    className='text-red-700 border-red-300 hover:bg-red-100'
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Reconnecting Banner */}
            {isRetrying && (
              <div className='mx-3 mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600'></div>
                  <p className='text-sm text-yellow-800'>Reconnecting to chat server...</p>
                </div>
              </div>
            )}

            <ScrollArea className='-mx-3 h-full p-3'>
              {filteredChatList.map((room) => {
                const otherParticipant = getOtherParticipant(room)
                const lastMessage = getLastMessage(room.id)
                const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.memberId) : false

                if (!otherParticipant) return null

                return (
                  <Fragment key={room.id}>
                    <button
                      type='button'
                      className={cn(
                        `hover:bg-secondary/75 -mx-1 flex w-full rounded-md px-2 py-2 text-left text-sm`,
                        activeRoom?.id === room.id && 'sm:bg-muted'
                      )}
                      onClick={() => {
                        selectRoom(room)
                        setMobileSelectedUser(room)
                      }}
                    >
                      <div className='flex gap-2 w-full'>
                        <div className='relative'>
                          <Avatar>
                            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.memberName} />
                            <AvatarFallback>{otherParticipant.memberName}</AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between'>
                            <span className='font-medium truncate'>{otherParticipant.memberName}</span>
                            {lastMessage && (
                              <span className='text-xs text-muted-foreground'>
                                {format(new Date(lastMessage.timestamp), 'h:mm a')}
                              </span>
                            )}
                          </div>
                          <div className='flex items-center gap-1'>
                            <span className='text-muted-foreground text-sm line-clamp-1'>
                              {typingUsers[room.id]?.length > 0
                                ? `${otherParticipant.memberName} is typing...`
                                : lastMessage
                                  ? lastMessage.senderId === getCurrentUserId()
                                    ? `You: ${lastMessage.message}`
                                    : lastMessage.message
                                  : 'No messages yet'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                    <Separator className='my-1' />
                  </Fragment>
                )
              })}
            </ScrollArea>
          </div>

          {/* Right Side - Chat Window */}
          {activeRoom ? (
            <div
              className={cn(
                'bg-primary-foreground absolute inset-0 left-full z-50 hidden w-full flex-1 flex-col rounded-md border shadow-xs transition-all duration-200 sm:static sm:z-auto sm:flex',
                mobileSelectedUser && 'left-0 flex'
              )}
            >
              {/* Chat Header */}
              <div className='bg-secondary mb-1 flex flex-none justify-between rounded-t-md p-4 shadow-lg'>
                <div className='flex gap-3'>
                  <Button
                    size='icon'
                    variant='ghost'
                    className='-ml-2 h-full sm:hidden'
                    onClick={() => setMobileSelectedUser(null)}
                  >
                    <ArrowLeft />
                  </Button>
                  {(() => {
                    const otherParticipant = getOtherParticipant(activeRoom)
                    const isOnline = otherParticipant ? onlineUsers.has(otherParticipant.memberId) : false

                    return otherParticipant ? (
                      <div className='flex items-center gap-2 lg:gap-4'>
                        <div className='relative'>
                          <Avatar className='size-9 lg:size-11'>
                            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.memberName} />
                            <AvatarFallback>{otherParticipant.memberName}</AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full'></div>
                          )}
                        </div>
                        <div>
                          <span className='text-sm font-medium lg:text-base block'>{otherParticipant.memberName}</span>
                          <span className='text-muted-foreground text-xs lg:text-sm block'>
                            {isOnline ? 'Online' : 'Offline'} • {otherParticipant.title}
                          </span>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>

                {/* Right */}
                <div className='-mr-1 flex items-center gap-1 lg:gap-2'>
                  <Button size='icon' variant='ghost' className='hidden size-8 rounded-full sm:inline-flex lg:size-10'>
                    <Video size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button size='icon' variant='ghost' className='hidden size-8 rounded-full sm:inline-flex lg:size-10'>
                    <Phone size={22} className='stroke-muted-foreground' />
                  </Button>
                  <Button size='icon' variant='ghost' className='h-10 rounded-md sm:h-8 sm:w-4 lg:h-10 lg:w-6'>
                    <DotSquare className='stroke-muted-foreground sm:size-5' />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className='flex flex-1 flex-col gap-2 rounded-md px-4 pt-0 pb-4'>
                <div className='flex size-full flex-1'>
                  <div className='chat-text-container relative -mr-4 flex flex-1 flex-col overflow-y-hidden'>
                    <div className='chat-flex flex h-40 w-full grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pr-4 pb-4'>
                      {/* Typing Indicator */}
                      {typingUsers[activeRoom.id]?.length > 0 && (
                        <div className='flex gap-2 items-center'>
                          <div className='bg-secondary self-start rounded-[16px_16px_16px_0] px-3 py-2'>
                            <div className='flex gap-1'>
                              <div className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'></div>
                              <div
                                className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                                style={{ animationDelay: '0.1s' }}
                              ></div>
                              <div
                                className='w-2 h-2 bg-muted-foreground rounded-full animate-bounce'
                                style={{ animationDelay: '0.2s' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      {Object.keys(groupedMessages).map((dateKey) => (
                        <Fragment key={dateKey}>
                          {groupedMessages[dateKey].map((msg, index) => (
                            <div
                              key={`${msg.id}-${index}`}
                              className={cn(
                                'chat-box max-w-72 px-3 py-2 break-words shadow-lg',
                                msg.senderId === getCurrentUserId()
                                  ? 'bg-primary/85 text-primary-foreground/75 self-end rounded-[16px_16px_0_16px]'
                                  : 'bg-secondary self-start rounded-[16px_16px_16px_0]'
                              )}
                            >
                              {msg.message}{' '}
                              <span
                                className={cn(
                                  'text-muted-foreground mt-1 block text-xs font-light italic',
                                  msg.senderId === getCurrentUserId() && 'text-right'
                                )}
                              >
                                {format(new Date(msg.timestamp), 'h:mm a')}
                              </span>
                            </div>
                          ))}
                          <div className='text-center text-xs'>{dateKey}</div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Message Input */}
                <form className='flex w-full flex-none gap-2' onSubmit={handleSendMessage}>
                  <div className='border-input focus-within:ring-ring flex flex-1 items-center gap-2 rounded-md border px-2 py-1 focus-within:ring-1 focus-within:outline-hidden lg:gap-4'>
                    <div className='space-x-1'>
                      <Button size='icon' type='button' variant='ghost' className='h-8 rounded-md'>
                        <Plus size={20} className='stroke-muted-foreground' />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <PhoneOutgoing size={20} className='stroke-muted-foreground' />
                      </Button>
                      <Button
                        size='icon'
                        type='button'
                        variant='ghost'
                        className='hidden h-8 rounded-md lg:inline-flex'
                      >
                        <Paperclip size={20} className='stroke-muted-foreground' />
                      </Button>
                    </div>
                    <label className='flex-1'>
                      <span className='sr-only'>Chat Text Box</span>
                      <input
                        type='text'
                        placeholder='Type your messages...'
                        className='h-8 w-full bg-inherit focus-visible:outline-hidden'
                        value={messageInput}
                        onChange={(e) => handleTyping(e.target.value)}
                        disabled={!isConnected}
                      />
                    </label>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='hidden sm:inline-flex'
                      type='submit'
                      disabled={!messageInput.trim() || !isConnected}
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                  <Button className='h-full sm:hidden' type='submit' disabled={!messageInput.trim() || !isConnected}>
                    <Send size={18} /> Send
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
                  <MessagesSquare className='size-8' />
                </div>
                <div className='space-y-2 text-center'>
                  <h1 className='text-xl font-semibold'>Your messages</h1>
                  <p className='text-muted-foreground text-sm'>Send a message to start a chat.</p>
                </div>
                <Button
                  className='bg-blue-500 px-6 text-white hover:bg-blue-600'
                  onClick={() => setCreateConversationDialog(true)}
                >
                  Send message
                </Button>
              </div>
            </div>
          )}
        </section>
        <NewChat
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          users={users as any}
          onOpenChange={setCreateConversationDialog}
          open={createConversationDialogOpened}
        />
      </Main>
    </>
  )
}
