import { useState, useEffect } from 'react'
import { Bell, BellOff, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useNotification } from '@/services/notification/notification.service'
import { toast } from 'sonner'

export function NotificationSettings() {
  const { requestPermission, hasPermission, isSupported, permissionStatus } = useNotification()

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load notification preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('chat-notifications-enabled')
    setIsNotificationsEnabled(savedPreference === 'true' && hasPermission)
  }, [hasPermission])

  // Save preference to localStorage
  const saveNotificationPreference = (enabled: boolean) => {
    localStorage.setItem('chat-notifications-enabled', enabled.toString())
    setIsNotificationsEnabled(enabled)
  }

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast.error('Trình duyệt không hỗ trợ thông báo desktop')
      return
    }

    setIsLoading(true)
    try {
      const permission = await requestPermission()

      if (permission === 'granted') {
        saveNotificationPreference(true)
        toast.success('Đã bật thông báo thành công!')
      } else if (permission === 'denied') {
        toast.error('Bạn đã từ chối quyền thông báo. Vui lòng bật trong cài đặt trình duyệt.')
        saveNotificationPreference(false)
      } else {
        toast.warning('Chưa được cấp quyền thông báo')
        saveNotificationPreference(false)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      toast.error('Có lỗi khi yêu cầu quyền thông báo')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = () => {
    saveNotificationPreference(false)
    toast.success('Đã tắt thông báo')
  }

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant='destructive'>Không hỗ trợ</Badge>
    }

    switch (permissionStatus) {
      case 'granted':
        return isNotificationsEnabled ? (
          <Badge variant='default'>Đang bật</Badge>
        ) : (
          <Badge variant='secondary'>Đã tắt</Badge>
        )
      case 'denied':
        return <Badge variant='destructive'>Đã từ chối</Badge>
      default:
        return <Badge variant='outline'>Chưa cấp phép</Badge>
    }
  }

  const getIcon = () => {
    return isNotificationsEnabled && hasPermission ? <Bell className='h-4 w-4' /> : <BellOff className='h-4 w-4' />
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          {getIcon()}
          {isNotificationsEnabled && hasPermission && (
            <div className='absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full' />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80' align='end'>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h4 className='font-medium'>Cài đặt thông báo</h4>
            <Settings className='h-4 w-4 text-muted-foreground' />
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='notifications-toggle'>Thông báo tin nhắn</Label>
              {getStatusBadge()}
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='notifications-toggle'
                checked={isNotificationsEnabled && hasPermission}
                onCheckedChange={(checked: boolean) => {
                  if (checked) {
                    handleEnableNotifications()
                  } else {
                    handleDisableNotifications()
                  }
                }}
                disabled={isLoading || !isSupported}
              />
              <Label htmlFor='notifications-toggle' className='text-sm text-muted-foreground'>
                {isNotificationsEnabled && hasPermission ? 'Đang bật' : 'Đang tắt'}
              </Label>
            </div>

            <p className='text-xs text-muted-foreground'>
              {!isSupported
                ? 'Trình duyệt của bạn không hỗ trợ thông báo desktop'
                : permissionStatus === 'denied'
                  ? 'Bạn đã từ chối quyền thông báo. Hãy bật trong cài đặt trình duyệt để sử dụng tính năng này.'
                  : 'Bật thông báo để nhận tin nhắn mới ngay cả khi không xem trang chat'}
            </p>

            {permissionStatus === 'denied' && (
              <Button
                variant='outline'
                size='sm'
                className='w-full'
                onClick={() => {
                  toast.info(
                    'Hãy vào cài đặt trình duyệt > Quyền riêng tư > Thông báo để bật lại quyền cho trang web này'
                  )
                }}
              >
                Hướng dẫn bật lại thông báo
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
