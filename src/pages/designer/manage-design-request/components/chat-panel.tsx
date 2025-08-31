import { useRef, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MessageSquare, Send, X, Minimize2, Maximize2, Calendar, Camera, Package, ChevronDown } from 'lucide-react'
import { ChatPanelProps } from '../types'
import { MessageContent } from '@/components/ui/message-content'
import { useAuthStore } from '@/lib/zustand/use-auth-store'

export const ChatPanel = ({
  isOpen,
  onClose,
  activeRequest,
  onSendMessage,
  messages,
  isLoadingMessages,
  newMessage,
  onNewMessageChange,
  isMinimized,
  onToggleMinimize,
  onSendPreset,
  onSendImage
}: ChatPanelProps) => {
  const [isCustomerInfoCollapsed, setIsCustomerInfoCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100)
      return () => clearTimeout(timer)
    }
  }, [messages])

  if (!isOpen) return null

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      onNewMessageChange('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isMinimized) {
    return (
      <div className='fixed bottom-4 right-4 z-50'>
        <Card className='w-96 shadow-2xl border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50'>
          <CardHeader
            className='pb-3 cursor-pointer hover:bg-violet-100/50 transition-colors rounded-t-lg'
            onClick={onToggleMinimize}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-3 w-3 bg-green-500 rounded-full animate-pulse'></div>
                <MessageSquare className='w-4 h-4 text-violet-600' />
                <CardTitle className='text-sm font-medium'>Chat với khách hàng</CardTitle>
                {activeRequest && (
                  <span className='text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full'>
                    {activeRequest.orderCode}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-1'>
                <ChevronDown className='w-4 h-4 text-violet-600' />
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleMinimize()
                  }}
                  className='hover:bg-violet-200'
                >
                  <Maximize2 className='w-4 h-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                  }}
                  className='hover:bg-red-100 hover:text-red-600'
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <Card className='w-[480px] h-[650px] shadow-2xl border-violet-200 flex flex-col max-w-[95vw] max-h-[85vh] bg-gradient-to-br from-white to-violet-50/30 !py-0'>
        <CardHeader className='pt-5 border-b border-violet-100 flex-shrink-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-t-lg'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='h-3 w-3 bg-green-400 rounded-full animate-pulse'></div>
              <MessageSquare className='w-5 h-5 text-white' />
              <CardTitle className='text-sm font-medium'>
                {activeRequest ? `Đơn ${activeRequest.orderCode}` : 'Chat với khách hàng'}
              </CardTitle>
            </div>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onToggleMinimize}
                className='hover:bg-white/20 text-white'
                title='Thu gọn'
              >
                <ChevronDown className='w-4 h-4' />
              </Button>
              <Button variant='ghost' size='sm' onClick={onToggleMinimize} className='hover:bg-white/20 text-white'>
                <Minimize2 className='w-4 h-4' />
              </Button>
              <Button variant='ghost' size='sm' onClick={onClose} className='hover:bg-red-500/20 text-white'>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        {activeRequest && (
          <div className='px-2 py-2 border-b bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex-shrink-0'>
            {/* Collapsible Header */}
            <div className='flex items-center justify-between mb-3'>
              <h4 className='text-sm font-medium text-gray-700'>Thông tin khách hàng</h4>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsCustomerInfoCollapsed(!isCustomerInfoCollapsed)}
                className='h-6 w-6 p-0 hover:bg-violet-100'
              >
                {isCustomerInfoCollapsed ? (
                  <ChevronDown className='w-4 h-4 text-violet-600' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-violet-600 rotate-180' />
                )}
              </Button>
            </div>

            {/* Collapsible Content */}
            {!isCustomerInfoCollapsed && (
              <>
                {/* Customer Info Row */}
                <div className='flex items-center gap-3 mb-4'>
                  <Avatar className='h-10 w-10 border-2 border-violet-200 shadow-sm'>
                    <AvatarFallback className='text-sm bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold'>
                      {activeRequest.orderItem.designRequest.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className='text-sm font-semibold text-gray-800'>
                        {activeRequest.orderItem.designRequest.username || 'Khách hàng'}
                      </span>
                      <div className='flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-full'>
                        <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse'></div>
                        <span className='text-xs text-green-700 font-medium'>Đang hoạt động</span>
                      </div>
                    </div>
                    <p className='text-xs text-gray-500'>Đơn hàng #{activeRequest.orderCode}</p>
                  </div>
                </div>

                {/* Order Details Row */}
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-violet-100 shadow-sm'>
                    <Calendar className='w-4 h-4 text-violet-600' />
                    <span className='text-sm font-medium text-gray-700'>Đơn: {activeRequest.orderCode}</span>
                  </div>
                  <div className='flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-violet-100 shadow-sm flex-1'>
                    <Camera className='w-4 h-4 text-violet-600' />
                    <span className='text-sm text-gray-700 truncate'>
                      {activeRequest.orderItem.designRequest.description || 'Thiết kế đầm bầu'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <CardContent className='flex-1 p-0 flex flex-col min-h-0'>
          <ScrollArea className='flex-1 p-3 min-h-0'>
            {isLoadingMessages ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto'></div>
                <p className='text-sm text-muted-foreground mt-2'>Đang tải tin nhắn...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className='text-center py-8'>
                <MessageSquare className='w-12 h-12 text-muted-foreground mx-auto mb-2' />
                <p className='text-sm text-muted-foreground'>Chưa có tin nhắn nào</p>
                <p className='text-xs text-muted-foreground mt-1'>Bắt đầu cuộc trò chuyện với khách hàng</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {messages.map((message, index) => {
                  // Kiểm tra xem có phải tin nhắn của designer không
                  const isDesignerMessage = message.senderId === user?.userId
                  // Kiểm tra xem có phải tin nhắn TEXT không (type = 0)
                  const isTextMessage = (typeof message.type === 'number' ? message.type : Number(message.type) || 0) === 0
                  // Chỉ áp dụng style tím cho tin nhắn không phải TEXT của designer
                  const shouldUseVioletStyle = isDesignerMessage && !isTextMessage
                  
                  return (
                    <div
                      key={index}
                      className={`flex ${isDesignerMessage ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div className={`max-w-[80%] ${isDesignerMessage ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg shadow-sm ${
                            shouldUseVioletStyle
                              ? 'bg-violet-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <MessageContent
                            message={message.message}
                            type={typeof message.type === 'number' ? message.type : Number(message.type) || 0}
                            className={shouldUseVioletStyle ? 'text-white' : ''}
                          />
                          <p
                            className={`text-xs mt-2 ${
                              shouldUseVioletStyle ? 'text-violet-100' : 'text-gray-500'
                            }`}
                          >
                            {message.senderName} • {new Date(message.timestamp).toLocaleTimeString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className='p-3 border-t bg-background flex-shrink-0'>
            {/* Send Preset Button */}
            {onSendPreset && (
              <div className='mb-2'>
                <Button
                  onClick={onSendPreset}
                  variant='outline'
                  size='sm'
                  className='w-full text-violet-600 border-violet-200 hover:bg-violet-50'
                >
                  <Package className='w-4 h-4 mr-2' />
                  Gửi Preset
                </Button>
              </div>
            )}

            <div className='flex gap-2 items-center'>
              {/* Image upload */}
              <input
                id='chat-image-input'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && onSendImage) {
                    onSendImage(file)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='px-2'
                onClick={() => document.getElementById('chat-image-input')?.click()}
                title='Gửi hình ảnh'
              >
                <Camera className='w-4 h-4' />
              </Button>
              <Input
                placeholder='Nhập tin nhắn...'
                value={newMessage}
                onChange={(e) => onNewMessageChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className='flex-1'
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size='sm'
                className='bg-violet-600 hover:bg-violet-700'
              >
                <Send className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
