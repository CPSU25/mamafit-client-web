import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Phone, Mail, MapPin, Calendar, CheckCircle, LogOut, XCircle, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Appointment, AppointmentStatus } from '@/@types/apointment.type'

interface AppointmentDetailSheetProps {
  appointment: Appointment | null
  isOpen: boolean
  onClose: () => void
  onCheckIn: (appointmentId: string) => void
  onCheckOut: (appointmentId: string) => void
  onCancel: (appointmentId: string) => void
}

export const AppointmentDetailSheet = ({
  appointment,
  isOpen,
  onClose,
  onCheckIn,
  onCheckOut,
  onCancel
}: AppointmentDetailSheetProps) => {
  if (!appointment) return null

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      [AppointmentStatus.UP_COMING]: { variant: 'secondary' as const, label: 'Sắp tới', color: 'text-yellow-600' },
      [AppointmentStatus.IN_PROGRESS]: { variant: 'default' as const, label: 'Đang diễn ra', color: 'text-blue-600' },
      [AppointmentStatus.COMPLETED]: { variant: 'secondary' as const, label: 'Hoàn thành', color: 'text-gray-600' },
      [AppointmentStatus.CANCELED]: { variant: 'destructive' as const, label: 'Đã hủy', color: 'text-red-600' }
    }

    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className='text-sm'>
        {config.label}
      </Badge>
    )
  }

  const renderActionButtons = () => {
    return (
      <div className='flex flex-col gap-3'>
        {/* Check-in (chỉ hiển thị khi status là UP_COMING) */}
        {appointment.status === AppointmentStatus.UP_COMING && (
          <Button onClick={() => onCheckIn(appointment.id)} className='bg-green-600 hover:bg-green-700 text-white'>
            <CheckCircle className='h-4 w-4 mr-2' />
            Bắt đầu phục vụ
          </Button>
        )}

        {/* Check-out (chỉ hiển thị khi status là IN_PROGRESS) */}
        {appointment.status === AppointmentStatus.IN_PROGRESS && (
          <Button onClick={() => onCheckOut(appointment.id)} className='bg-blue-600 hover:bg-blue-700 text-white'>
            <LogOut className='h-4 w-4 mr-2' />
            Hoàn thành phục vụ
          </Button>
        )}

        {/* Hủy lịch (không hiển thị cho COMPLETED và CANCELED) */}
        {![AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED].includes(appointment.status) && (
          <Button
            variant='outline'
            onClick={() => onCancel(appointment.id)}
            className='border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
          >
            <XCircle className='h-4 w-4 mr-2' />
            Hủy lịch hẹn
          </Button>
        )}
      </div>
    )
  }

  const timelineItems = [
    {
      time: appointment.createdAt,
      label: 'Tạo lịch hẹn',
      icon: Calendar,
      color: 'text-blue-500'
    }
  ]
    .filter((item) => item.time)
    .sort((a, b) => new Date(a.time!).getTime() - new Date(b.time!).getTime())

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-md overflow-y-auto'>
        <SheetHeader className='pb-6'>
          <SheetTitle className='text-xl'>Chi tiết lịch hẹn</SheetTitle>
          <SheetDescription>Thông tin chi tiết về lịch hẹn và khách hàng</SheetDescription>
        </SheetHeader>

        <div className='space-y-6'>
          {/* Thông tin khách hàng */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Thông tin khách hàng</h3>

            <div className='flex items-center gap-4'>
              <Avatar className='h-16 w-16'>
                <AvatarImage src={appointment.user.profilePicture} />
                <AvatarFallback className='text-lg'>{appointment.user.fullName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className='flex-1'>
                <h4 className='font-medium text-lg'>{appointment.user.fullName}</h4>
                <div className='space-y-1 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4' />
                    <span>{appointment.user.phoneNumber}</span>
                  </div>
                  {appointment.user.userEmail && (
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4' />
                      <span>{appointment.user.userEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin lịch hẹn */}
          <div className='space-y-4'>
            <h3 className='font-semibold text-lg'>Thông tin lịch hẹn</h3>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Trạng thái:</span>
                {getStatusBadge(appointment.status)}
              </div>

              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  <strong>Thời gian hẹn:</strong>{' '}
                  {format(parseISO(appointment.bookingTime), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  <strong>Chi nhánh:</strong> {appointment.branch.name}
                </span>
              </div>

              <div className='text-sm text-muted-foreground ml-6'>
                {appointment.branch.street}, {appointment.branch.ward}, {appointment.branch.district},{' '}
                {appointment.branch.province}
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {appointment.note && (
            <>
              <Separator />
              <div className='space-y-3'>
                <h3 className='font-semibold text-lg flex items-center gap-2'>
                  <FileText className='h-5 w-5' />
                  Ghi chú
                </h3>
                <div className='bg-muted/50 rounded-lg p-3'>
                  <p className='text-sm'>{appointment.note}</p>
                </div>
              </div>
            </>
          )}

          {/* Timeline hoạt động */}
          {timelineItems.length > 0 && (
            <>
              <Separator />
              <div className='space-y-3'>
                <h3 className='font-semibold text-lg'>Lịch sử hoạt động</h3>
                <div className='space-y-3'>
                  {timelineItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div key={index} className='flex items-center gap-3'>
                        <div className={`p-2 rounded-full bg-muted ${item.color}`}>
                          <Icon className='h-4 w-4' />
                        </div>
                        <div className='flex-1'>
                          <div className='font-medium text-sm'>{item.label}</div>
                          <div className='text-xs text-muted-foreground'>
                            {format(parseISO(item.time!), 'HH:mm - dd/MM/yyyy', { locale: vi })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Nút hành động */}
          <Separator />
          {renderActionButtons()}
        </div>
      </SheetContent>
    </Sheet>
  )
}
