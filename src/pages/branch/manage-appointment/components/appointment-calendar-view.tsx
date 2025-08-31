import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, XCircle, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { Appointment, AppointmentStatus } from '@/@types/apointment.type'
import { cn } from '@/lib/utils/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'

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
  const [currentMonth, setCurrentMonth] = useState(selectedDate)

  // Lọc lại danh sách appointments cho ngày được chọn
  const selectedDayAppointments = appointments
    .filter((appointment) => isSameDay(parseISO(appointment.bookingTime), selectedDate))
    .sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())

  // Tạo calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday start
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Tính toán appointment stats cho mỗi ngày
  const getDayAppointments = (day: Date) => {
    return appointments.filter((apt) => isSameDay(parseISO(apt.bookingTime), day))
  }

  const getDayStats = (day: Date) => {
    const dayAppointments = getDayAppointments(day)
    return {
      total: dayAppointments.length,
      completed: dayAppointments.filter((apt) => apt.status === AppointmentStatus.CHECKED_OUT).length,
      pending: dayAppointments.filter(
        (apt) => apt.status === AppointmentStatus.UP_COMING || apt.status === AppointmentStatus.CHECKED_IN
      ).length,
      inProgress: dayAppointments.filter((apt) => apt.status === AppointmentStatus.CHECKED_IN).length,
      cancelled: dayAppointments.filter((apt) => apt.status === AppointmentStatus.CANCELED).length
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDayClick = (day: Date) => {
    onDateSelect(day)
    setCurrentMonth(day) // Sync current month with selected date
  }

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  return (
    <div className='grid grid-cols-1 gap-6 p-6 lg:grid-cols-5'>
      {/* Calendar Section */}
      <div className='lg:col-span-3'>
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Lịch</h2>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='icon' onClick={handlePrevMonth} className='h-8 w-8'>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='min-w-[120px] text-center'>
                  <span className='text-lg font-medium'>{format(currentMonth, 'MMMM yyyy', { locale: vi })}</span>
                </div>
                <Button variant='outline' size='icon' onClick={handleNextMonth} className='h-8 w-8'>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='grid grid-cols-7 gap-px bg-border'>
              {/* Week day headers */}
              {weekDays.map((day) => (
                <div key={day} className='bg-muted/30 p-3 text-center text-sm font-medium text-muted-foreground'>
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, dayIdx) => {
                const dayStats = getDayStats(day)
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = isSameDay(day, selectedDate)
                const isToday = isSameDay(day, new Date())
                const hasAppointments = dayStats.total > 0

                return (
                  <div
                    key={dayIdx}
                    className={cn(
                      'relative min-h-[80px] bg-background p-2 cursor-pointer transition-colors hover:bg-accent/50',
                      !isCurrentMonth && 'bg-muted/20 text-muted-foreground',
                      isSelected && 'bg-primary/10 ring-2 ring-primary ring-inset',
                      isToday && !isSelected && 'bg-accent'
                    )}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className='flex h-full flex-col'>
                      <div className='flex items-center justify-between'>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            !isCurrentMonth && 'text-muted-foreground',
                            isToday && 'font-bold text-primary'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {isToday && <div className='h-2 w-2 rounded-full bg-primary'></div>}
                      </div>

                      {/* Appointment indicators */}
                      {hasAppointments && (
                        <div className='mt-1 space-y-1'>
                          {dayStats.pending > 0 && (
                            <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                              <span className='text-xs text-yellow-600 font-medium'>{dayStats.pending} chờ</span>
                            </div>
                          )}
                          {dayStats.completed > 0 && (
                            <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-green-500'></div>
                              <span className='text-xs text-green-600 font-medium'>
                                {dayStats.completed} hoàn thành
                              </span>
                            </div>
                          )}
                          {dayStats.inProgress > 0 && (
                            <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                              <span className='text-xs text-blue-600 font-medium'>
                                {dayStats.inProgress} đang xử lý
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Detail Section */}
      <div className='lg:col-span-2'>
        <Card className='h-full'>
          <CardHeader>
            <CardTitle className='text-lg'>
              Lịch hẹn
              <div className='mt-1 text-sm font-normal text-muted-foreground'>
                {format(selectedDate, 'dd MMMM, yyyy', { locale: vi })}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <ScrollArea className='h-[65vh]'>
              <div className='space-y-4 p-6 pt-0'>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className='h-28 w-full' />)
                ) : selectedDayAppointments.length === 0 ? (
                  <div className='flex h-[40vh] flex-col items-center justify-center text-center'>
                    <CalendarIcon className='h-16 w-16 text-muted-foreground/50' />
                    <h3 className='mt-4 text-lg font-semibold'>Không có lịch hẹn</h3>
                    <p className='text-muted-foreground'>Không tìm thấy lịch hẹn nào trong ngày này.</p>
                  </div>
                ) : (
                  selectedDayAppointments.map((apt) => <AppointmentItem key={apt.id} appointment={apt} {...props} />)
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
  const { user, bookingTime } = appointment

  return (
    <div className='rounded-lg border bg-card p-4 transition-all hover:shadow-md'>
      <div className='space-y-4'>
        {/* Header with avatar and name */}
        <div className='flex items-start gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback className='bg-primary/10 text-primary font-medium'>
              {user.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 space-y-1'>
            <div className='flex items-center gap-2'>
              <h4 className='font-semibold text-foreground'>{user.fullName}</h4>
              <Badge variant='outline' className={cn('text-xs', styles.badge)}>
                {statusStyles[appointment.status]?.label || 'Không rõ'}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>Phone number: {user.phoneNumber}</p>
          </div>
        </div>

        {/* Time and details */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-sm font-medium'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span>{format(parseISO(bookingTime), 'HH:mm')}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 px-2 text-muted-foreground hover:text-foreground'
                onClick={() => onViewDetail(appointment)}
              >
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {appointment.status === AppointmentStatus.UP_COMING && (
              <Button
                variant='default'
                size='sm'
                className='h-8 bg-green-500 hover:bg-green-600'
                onClick={() => onCheckIn(appointment.id)}
              >
                Xác nhận
              </Button>
            )}
            {appointment.status === AppointmentStatus.CHECKED_IN && (
              <Button variant='default' size='sm' className='h-8' onClick={() => onCheckOut(appointment.id)}>
                Hoàn thành
              </Button>
            )}
          </div>

          {![AppointmentStatus.CHECKED_OUT, AppointmentStatus.CANCELED].includes(appointment.status) && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground hover:text-destructive'
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
