import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Phone, Mail, MapPin, Calendar, CheckCircle, LogOut, XCircle, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Appointment, AppointmentStatus } from '@/@types/apointment.type'
import { cn } from '@/lib/utils/utils'

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

  // ----- LOGIC GỐC CỦA BẠN ĐƯỢC GIỮ NGUYÊN -----
  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      [AppointmentStatus.UP_COMING]: { label: 'Sắp tới', className: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },

      [AppointmentStatus.CANCELED]: {
        label: 'Đã hủy',
        className: 'bg-destructive/10 text-destructive border-destructive/20'
      },
      [AppointmentStatus.CHECKED_IN]: {
        label: 'Đã check-in',
        className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      },
      [AppointmentStatus.CHECKED_OUT]: {
        label: 'Đã check-out',
        className: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      }
    }

    const config = statusConfig[status] || { label: 'Không rõ', className: 'bg-muted text-muted-foreground' }
    return (
      <Badge variant='outline' className={cn('border', config.className)}>
        {config.label}
      </Badge>
    )
  }

  const renderActionButtons = () => {
    return (
      <div className='w-full space-y-2'>
        {appointment.status === AppointmentStatus.UP_COMING && (
          <Button
            onClick={() => onCheckIn(appointment.id)}
            className='w-full bg-green-500 hover:bg-green-600 text-white'
          >
            <CheckCircle className='mr-2 h-4 w-4' /> Bắt đầu phục vụ
          </Button>
        )}
        {appointment.status === AppointmentStatus.CHECKED_IN && (
          <Button onClick={() => onCheckOut(appointment.id)} className='w-full bg-sky-500 hover:bg-sky-600 text-white'>
            <LogOut className='mr-2 h-4 w-4' /> Hoàn thành phục vụ
          </Button>
        )}
        {![AppointmentStatus.CHECKED_OUT, AppointmentStatus.CANCELED].includes(appointment.status) && (
          <Button variant='destructive' onClick={() => onCancel(appointment.id)} className='w-full'>
            <XCircle className='mr-2 h-4 w-4' /> Hủy lịch hẹn
          </Button>
        )}
      </div>
    )
  }

  // ----- GIAO DIỆN ĐƯỢC REFECTOR -----
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='flex flex-col gap-0 p-0 sm:max-w-md'>
        <SheetHeader className='p-6 bg-muted'>
          <SheetTitle>Chi tiết lịch hẹn</SheetTitle>
          <SheetDescription>Thông tin về lịch hẹn và khách hàng.</SheetDescription>
        </SheetHeader>

        <div className='flex-1 space-y-6 overflow-y-auto p-6'>
          <div className='space-y-4'>
            <h3 className='font-semibold'>Thông tin khách hàng</h3>
            <div className='flex items-center gap-4'>
              <Avatar className='h-14 w-14'>
                <AvatarImage src={appointment.user.profilePicture} />
                <AvatarFallback>{appointment.user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className='space-y-1 text-sm'>
                <p className='font-medium text-base'>{appointment.user.fullName}</p>
                <div className='text-muted-foreground flex items-center'>
                  <Phone className='mr-2 h-3 w-3' />
                  {appointment.user.phoneNumber}
                </div>
                {appointment.user.userEmail && (
                  <div className='text-muted-foreground flex items-center'>
                    <Mail className='mr-2 h-3 w-3' />
                    {appointment.user.userEmail}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Separator />
          <div className='space-y-4'>
            <h3 className='font-semibold'>Thông tin lịch hẹn</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between items-center'>
                <span>Trạng thái</span>
                {getStatusBadge(appointment.status)}
              </div>
              <div className='flex items-start'>
                <Calendar className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0' />
                <span>
                  <strong>Thời gian:</strong>{' '}
                  {format(parseISO(appointment.bookingTime), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              <div className='flex items-start'>
                <MapPin className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0' />
                <span>
                  <strong>Chi nhánh:</strong> {appointment.branch.name}
                </span>
              </div>
            </div>
          </div>
          {appointment.note && (
            <>
              <Separator />
              <div className='space-y-2'>
                <h3 className='font-semibold flex items-center'>
                  <FileText className='mr-2 h-4 w-4' />
                  Ghi chú
                </h3>
                <p className='text-sm text-muted-foreground bg-muted p-3 rounded-md border'>{appointment.note}</p>
              </div>
            </>
          )}
        </div>

        <SheetFooter className='p-6 bg-muted mt-auto'>{renderActionButtons()}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
