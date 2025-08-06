import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, MapPin, Phone, CheckCircle, LogOut, Eye, XCircle, Calendar as CalendarIcon } from 'lucide-react'
import { format, isSameDay, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Appointment, AppointmentStatus } from '@/@types/apointment.type'
import { cn } from '@/lib/utils/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface AppointmentCalendarViewProps {
  appointments: Appointment[]
  isLoading: boolean
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onViewDetail: (appointment: Appointment) => void
  onCheckIn: (appointmentId: string) => void
  onCheckOut: (appointmentId: string) => void
  onCancel: (appointmentId: string) => void
}

const statusStyles = {
  [AppointmentStatus.UP_COMING]: {
    badge: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    border: 'border-l-sky-500',
    label: 'Sắp tới'
  },
  [AppointmentStatus.IN_PROGRESS]: {
    badge: 'bg-green-500/10 text-green-500 border-green-500/20',
    border: 'border-l-green-500',
    label: 'Đang diễn ra'
  },
  [AppointmentStatus.COMPLETED]: {
    badge: 'bg-muted text-muted-foreground border-border',
    border: 'border-l-gray-500',
    label: 'Hoàn thành'
  },
  [AppointmentStatus.CANCELED]: {
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    border: 'border-l-destructive',
    label: 'Đã huỷ'
  },
  [AppointmentStatus.CHECKED_IN]: {
    badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    border: 'border-l-yellow-500',
    label: 'Đã check-in'
  },
  [AppointmentStatus.CHECKED_OUT]: {
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    border: 'border-l-blue-500',
    label: 'Đã check-out'
  },
  // Mặc định nếu không có trạng thái phù hợp

  default: { badge: 'bg-muted text-muted-foreground border-border', border: 'border-l-gray-300', label: 'Không rõ' }
}

export const AppointmentCalendarView = ({
  appointments,
  isLoading,
  selectedDate,
  onDateSelect,
  ...props
}: AppointmentCalendarViewProps) => {
  // Lọc lại danh sách appointments (đã có từ API theo dateRange) để chỉ lấy các lịch hẹn của ngày `selectedDate`
  const selectedDayAppointments = appointments
    .filter((appointment) => isSameDay(parseISO(appointment.bookingTime), selectedDate))
    .sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())

  // Dùng `appointments` để đánh dấu các ngày có lịch hẹn trên lịch
  const appointmentDates = appointments.map((apt) => parseISO(apt.bookingTime))

  return (
    <div className='grid grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-3'>
      {/* Calendar Section */}
      <div className='lg:col-span-1'>
        <Card>
          <CardContent className='p-3'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect(date)}
              locale={vi}
              className='p-0'
              // Đánh dấu các ngày có lịch hẹn trong khoảng đã fetch
              modifiers={{ hasAppointments: (date) => appointmentDates.some((aptDate) => isSameDay(aptDate, date)) }}
              modifiersClassNames={{ hasAppointments: 'bg-accent/50 !font-bold' }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Appointments List Section */}
      <div className='lg:col-span-2'>
        <Card className='h-full'>
          <CardHeader>
            <CardTitle className='text-lg'>
              Lịch hẹn ngày {format(selectedDate, 'dd/MM/yyyy')}
              <Badge variant='secondary' className='ml-2'>
                {selectedDayAppointments.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <ScrollArea className='h-[65vh] lg:h-[60vh]'>
              <div className='space-y-4 p-4 pt-0'>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className='h-28 w-full' />)
                ) : selectedDayAppointments.length === 0 ? (
                  // --- CẢI TIẾN THÔNG BÁO EMPTY STATE ---
                  <div className='flex h-[40vh] flex-col items-center justify-center text-center'>
                    <CalendarIcon className='h-16 w-16 text-muted-foreground/50' />
                    <h3 className='mt-4 text-lg font-semibold'>Không có lịch hẹn</h3>
                    <p className='text-muted-foreground'>
                      Không tìm thấy lịch hẹn nào trong ngày {format(selectedDate, 'dd/MM/yyyy')}.
                    </p>
                  </div>
                ) : (
                  selectedDayAppointments.map((apt) => (
                    // Giả sử có component AppointmentItem để render
                    <AppointmentItem key={apt.id} appointment={apt} {...props} />
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const AppointmentItem = ({
  appointment,
  onViewDetail,
  onCheckIn,
  onCheckOut,
  onCancel
}: { appointment: Appointment } & Omit<
  AppointmentCalendarViewProps,
  'appointments' | 'isLoading' | 'selectedDate' | 'onDateSelect'
>) => {
  const styles = statusStyles[appointment.status] || statusStyles.default
  const { user, bookingTime, branch } = appointment

  return (
    <div className={cn('rounded-lg border p-4 transition-shadow hover:shadow-md', styles.border, 'border-l-4')}>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex flex-1 items-start gap-4'>
          <Avatar className='hidden sm:block'>
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-2'>
            <div className='flex items-center gap-2 flex-wrap'>
              <p className='font-semibold'>{user.fullName}</p>
              <Badge variant='outline' className={cn('text-xs', styles.badge)}>
                {statusStyles[appointment.status]?.label || 'Không rõ'}
              </Badge>
            </div>
            <div className='space-y-1 text-sm text-muted-foreground'>
              <div className='flex items-center'>
                <Phone className='mr-2 h-3 w-3' />
                {user.phoneNumber}
              </div>
              <div className='flex items-center'>
                <Clock className='mr-2 h-3 w-3' />
                {format(parseISO(bookingTime), 'HH:mm')}
              </div>
              <div className='flex items-center'>
                <MapPin className='mr-2 h-3 w-3' />
                {branch.name}
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-1 self-start sm:self-center'>
          <Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => onViewDetail(appointment)}>
            <Eye className='h-4 w-4' />
          </Button>
          {appointment.status === AppointmentStatus.UP_COMING && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-green-500 hover:text-green-600'
              onClick={() => onCheckIn(appointment.id)}
            >
              <CheckCircle className='h-4 w-4' />
            </Button>
          )}
          {appointment.status === AppointmentStatus.IN_PROGRESS && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-sky-500 hover:text-sky-600'
              onClick={() => onCheckOut(appointment.id)}
            >
              <LogOut className='h-4 w-4' />
            </Button>
          )}
          {![AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED].includes(appointment.status) && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-destructive hover:text-destructive/90'
              onClick={() => onCancel(appointment.id)}
            >
              <XCircle className='h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
