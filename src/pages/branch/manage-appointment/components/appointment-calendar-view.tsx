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

export const AppointmentCalendarView = ({
  appointments,
  isLoading,
  selectedDate,
  onDateSelect,
  onViewDetail,
  onCheckIn,
  onCheckOut,
  onCancel
}: AppointmentCalendarViewProps) => {
  // Lọc lịch hẹn theo ngày được chọn
  const selectedDayAppointments = appointments.filter((appointment) =>
    isSameDay(parseISO(appointment.bookingTime), selectedDate)
  )

  // Tạo map của các ngày có appointments
  const appointmentDates = appointments.map((apt) => parseISO(apt.bookingTime))

  // Function để kiểm tra ngày có appointment hay không
  const hasAppointments = (date: Date) => {
    return appointmentDates.some((aptDate) => isSameDay(aptDate, date))
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      [AppointmentStatus.UP_COMING]: {
        variant: 'secondary' as const,
        label: 'Sắp tới',
        color: 'bg-yellow-100 text-yellow-800'
      },
      [AppointmentStatus.IN_PROGRESS]: {
        variant: 'default' as const,
        label: 'Đang diễn ra',
        color: 'bg-blue-100 text-blue-800'
      },
      [AppointmentStatus.COMPLETED]: {
        variant: 'secondary' as const,
        label: 'Hoàn thành',
        color: 'bg-green-100 text-green-800'
      },
      [AppointmentStatus.CANCELED]: {
        variant: 'destructive' as const,
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-800'
      }
    }

    const config = statusConfig[status] || {
      variant: 'secondary' as const,
      label: 'Không xác định',
      color: 'bg-gray-100 text-gray-800'
    }
    return <Badge className={`text-xs font-medium ${config.color} border-0`}>{config.label}</Badge>
  }

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.UP_COMING:
        return 'border-l-yellow-500'
      case AppointmentStatus.IN_PROGRESS:
        return 'border-l-blue-500'
      case AppointmentStatus.COMPLETED:
        return 'border-l-gray-500'
      case AppointmentStatus.CANCELED:
        return 'border-l-red-500'
      default:
        return 'border-l-gray-300'
    }
  }

  const renderActionButtons = (appointment: Appointment) => {
    const baseClass = 'h-8 w-8 p-0'

    return (
      <div className='flex items-center gap-1'>
        {/* Luôn hiển thị nút xem chi tiết */}
        <Button
          variant='ghost'
          size='sm'
          className={baseClass}
          onClick={() => onViewDetail(appointment)}
          title='Xem chi tiết'
        >
          <Eye className='h-4 w-4' />
        </Button>

        {/* Check-in (chỉ hiển thị khi status là UP_COMING) */}
        {appointment.status === AppointmentStatus.UP_COMING && (
          <Button
            variant='ghost'
            size='sm'
            className={`${baseClass} text-green-600 hover:text-green-700 hover:bg-green-50`}
            onClick={() => onCheckIn(appointment.id)}
            title='Bắt đầu phục vụ'
          >
            <CheckCircle className='h-4 w-4' />
          </Button>
        )}

        {/* Check-out (chỉ hiển thị khi status là IN_PROGRESS) */}
        {appointment.status === AppointmentStatus.IN_PROGRESS && (
          <Button
            variant='ghost'
            size='sm'
            className={`${baseClass} text-blue-600 hover:text-blue-700 hover:bg-blue-50`}
            onClick={() => onCheckOut(appointment.id)}
            title='Hoàn thành'
          >
            <LogOut className='h-4 w-4' />
          </Button>
        )}

        {/* Hủy lịch (không hiển thị cho COMPLETED và CANCELED) */}
        {![AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED].includes(appointment.status) && (
          <Button
            variant='ghost'
            size='sm'
            className={`${baseClass} text-red-600 hover:text-red-700 hover:bg-red-50`}
            onClick={() => onCancel(appointment.id)}
            title='Hủy lịch'
          >
            <XCircle className='h-4 w-4' />
          </Button>
        )}
      </div>
    )
  }

  // Sắp xếp lịch hẹn theo thời gian
  const sortedAppointments = selectedDayAppointments.sort(
    (a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime()
  )

  return (
    <div className='p-6'>
      <div className='grid grid-cols-1 xl:grid-cols-4 gap-8'>
        {/* Calendar - Enhanced */}
        <div className='xl:col-span-1'>
          <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50'>
            <CardHeader className='pb-4'>
              <CardTitle className='text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                📅 Lịch
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={(date) => date && onDateSelect(date)}
                locale={vi}
                className='rounded-xl border-0 shadow-inner bg-gray-50/50'
                modifiers={{
                  hasAppointments: (date) => hasAppointments(date)
                }}
                modifiersClassNames={{
                  hasAppointments:
                    'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-900 font-bold border border-purple-200 shadow-sm'
                }}
              />

              {/* Legend với improved styling */}
              <div className='space-y-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm'>
                <h4 className='font-semibold text-gray-700 text-sm'>Chú thích</h4>
                <div className='space-y-2'>
                  <div className='flex items-center gap-3 text-xs'>
                    <div className='w-4 h-4 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200'></div>
                    <span className='text-gray-600 font-medium'>Ngày có lịch hẹn</span>
                  </div>
                  <div className='flex items-center gap-3 text-xs'>
                    <div className='w-4 h-4 rounded-lg bg-primary shadow-sm'></div>
                    <span className='text-gray-600 font-medium'>Ngày được chọn</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách lịch hẹn - Enhanced */}
        <div className='xl:col-span-3'>
          <Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 h-full'>
            {/* Chỉ hiển thị header khi có lịch hẹn */}
            {sortedAppointments.length > 0 && (
              <CardHeader className='border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                    📋 Lịch hẹn ngày {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='secondary'
                      className='bg-white/80 text-purple-700 border border-purple-200 font-semibold px-3 py-1 shadow-sm'
                    >
                      {sortedAppointments.length} lịch hẹn
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            )}
            <CardContent className='p-0'>
              {isLoading ? (
                <ScrollArea className='h-[650px]'>
                  <div className='p-6'>
                    <div className='space-y-4'>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className='border rounded-xl p-6 animate-pulse bg-white shadow-sm'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-4'>
                              <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                              <div className='space-y-3'>
                                <div className='h-5 bg-gray-200 rounded w-40'></div>
                                <div className='h-3 bg-gray-200 rounded w-32'></div>
                                <div className='h-3 bg-gray-200 rounded w-24'></div>
                              </div>
                            </div>
                            <div className='h-8 bg-gray-200 rounded-lg w-24'></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              ) : sortedAppointments.length === 0 ? (
                // Trường hợp không có lịch hẹn - Full screen display
                <div className='flex flex-col items-center justify-center h-[650px] text-center px-6'>
                  <div className='w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center'>
                    <CalendarIcon className='h-16 w-16 text-purple-400' />
                  </div>
                  <h3 className='text-2xl font-bold text-gray-700 mb-4'>Không có lịch hẹn</h3>
                  <p className='text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed'>
                    Không có lịch hẹn nào trong ngày{' '}
                    <span className='font-semibold text-gray-700'>
                      {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}
                    </span>
                    . Hãy chọn ngày khác hoặc tạo lịch hẹn mới.
                  </p>
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Button
                      variant='outline'
                      onClick={() => onDateSelect(new Date())}
                      className='px-6 py-3 text-sm font-medium border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200'
                    >
                      📅 Về hôm nay
                    </Button>
                    <Button
                      onClick={() => {
                        /* TODO: Implement create appointment */
                      }}
                      className='px-6 py-3 text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200'
                    >
                      ➕ Tạo lịch hẹn mới
                    </Button>
                  </div>
                </div>
              ) : (
                // Trường hợp có lịch hẹn
                <ScrollArea className='h-[650px]'>
                  <div className='p-6'>
                    <div className='space-y-4'>
                      {sortedAppointments.map((appointment, index) => (
                        <div key={appointment.id}>
                          <div
                            className={cn(
                              'bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border-l-4 group hover:-translate-y-1',
                              getStatusColor(appointment.status)
                            )}
                          >
                            <div className='flex items-start justify-between mb-4'>
                              <div className='flex items-start gap-4'>
                                <div className='relative'>
                                  <Avatar className='h-12 w-12 ring-2 ring-white shadow-lg'>
                                    <AvatarImage src={appointment.user.profilePicture} />
                                    <AvatarFallback className='bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-700 font-semibold'>
                                      {appointment.user.fullName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white'></div>
                                </div>

                                <div className='min-w-0 flex-1'>
                                  <div className='flex items-center gap-3 mb-2'>
                                    <h4 className='font-semibold text-lg text-gray-800'>{appointment.user.fullName}</h4>
                                    {getStatusBadge(appointment.status)}
                                  </div>

                                  <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600'>
                                    <div className='flex items-center gap-2'>
                                      <Phone className='h-4 w-4 text-purple-500' />
                                      <span className='font-medium'>{appointment.user.phoneNumber}</span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                      <Clock className='h-4 w-4 text-blue-500' />
                                      <span className='font-medium'>
                                        {format(parseISO(appointment.bookingTime), 'HH:mm', { locale: vi })}
                                      </span>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                      <MapPin className='h-4 w-4 text-emerald-500' />
                                      <span className='font-medium'>{appointment.branch.name}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className='flex items-center gap-2'>{renderActionButtons(appointment)}</div>
                            </div>

                            {appointment.note && (
                              <div className='bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200'>
                                <div className='flex items-start gap-2'>
                                  <div className='w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0'></div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-700 mb-1'>Ghi chú:</p>
                                    <p className='text-sm text-gray-600'>{appointment.note}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {index < sortedAppointments.length - 1 && (
                            <div className='flex items-center gap-4 my-6'>
                              <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
                              <div className='w-2 h-2 rounded-full bg-gray-300'></div>
                              <div className='flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
