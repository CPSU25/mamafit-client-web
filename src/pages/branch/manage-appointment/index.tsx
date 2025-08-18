import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import {
  useAppointments,
  useAppointmentStats,
  useCheckInAppointment,
  useCheckOutAppointment,
  useCancelAppointment
} from '@/services/global/appointment.service'
import { Appointment, AppointmentFilters } from '@/@types/apointment.type'

import { AppointmentStatsCards } from './components/appointment-stats-cards'
import { AppointmentToolbar } from './components/appointment-toolbar'
import { AppointmentCalendarView } from './components/appointment-calendar-view'
import { AppointmentDetailSheet } from './components/appointment-detail-sheet'
import { ConfirmActionDialog } from './components/confirm-action-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

const ManageAppointmentPage = () => {
  // ----- TOÀN BỘ PHẦN LOGIC NÀY KHÔNG THAY ĐỔI -----
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filters, setFilters] = useState<AppointmentFilters>({})
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'check-in' | 'check-out' | 'cancel' | null
    appointmentId: string | null
    title: string
    description: string
  }>({ isOpen: false, type: null, appointmentId: null, title: '', description: '' })

  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments
  } = useAppointments(1, 100, filters)

  const appointments = appointmentsData?.data?.items || []
  const stats = useAppointmentStats(appointments)
  const checkInMutation = useCheckInAppointment()
  const checkOutMutation = useCheckOutAppointment()
  const cancelMutation = useCancelAppointment()

  const handleDateSelect = (date: Date) => setSelectedDate(date)
  const handleFiltersChange = (newFilters: AppointmentFilters) => {
    // Cập nhật state của bộ lọc (như cũ)
    setFilters(newFilters)

    if (newFilters.dateRange && newFilters.dateRange.from) {
      setSelectedDate(newFilters.dateRange.from)
    }
  }
  const handleViewDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDetailSheetOpen(true)
  }
  const handleCloseDetailSheet = () => {
    setIsDetailSheetOpen(false)
    setSelectedAppointment(null)
  }
  const handleCreateAppointment = () => toast.info('Chức năng sẽ được triển khai')
  const showConfirmDialog = (
    type: 'check-in' | 'check-out' | 'cancel',
    appointmentId: string,
    customerName: string
  ) => {
    const configs = {
      'check-in': {
        title: 'Xác nhận Check-in',
        description: `Bạn có chắc chắn muốn check-in cho khách hàng "${customerName}"?`
      },
      'check-out': {
        title: 'Xác nhận Check-out',
        description: `Bạn có chắc chắn muốn check-out cho khách hàng "${customerName}"?`
      },
      cancel: {
        title: 'Xác nhận Hủy lịch',
        description: `Bạn có chắc chắn muốn hủy lịch hẹn của khách hàng "${customerName}"?`
      }
    }
    setConfirmDialog({
      isOpen: true,
      type,
      appointmentId,
      title: configs[type].title,
      description: configs[type].description
    })
  }
  const handleCloseConfirmDialog = () =>
    setConfirmDialog({ isOpen: false, type: null, appointmentId: null, title: '', description: '' })
  const handleConfirmAction = async () => {
    if (!confirmDialog.appointmentId || !confirmDialog.type) return
    try {
      switch (confirmDialog.type) {
        case 'check-in':
          await checkInMutation.mutateAsync(confirmDialog.appointmentId)
          break
        case 'check-out':
          await checkOutMutation.mutateAsync(confirmDialog.appointmentId)
          break
        case 'cancel':
          await cancelMutation.mutateAsync({ id: confirmDialog.appointmentId })
          break
      }
      await refetchAppointments()
      handleCloseConfirmDialog()
      if (selectedAppointment?.id === confirmDialog.appointmentId) {
        handleCloseDetailSheet()
      }
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }
  const handleCheckIn = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId)
    if (apt) showConfirmDialog('check-in', appointmentId, apt.user.fullName)
  }
  const handleCheckOut = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId)
    if (apt) showConfirmDialog('check-out', appointmentId, apt.user.fullName)
  }
  const handleCancel = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId)
    if (apt) showConfirmDialog('cancel', appointmentId, apt.user.fullName)
  }
  const isAnyMutationLoading = checkInMutation.isPending || checkOutMutation.isPending || cancelMutation.isPending

  // ----- PHẦN GIAO DIỆN (UI/UX) ĐƯỢC REFECTOR -----

  if (isLoadingAppointments && !appointmentsData) {
    return (
      <div className='p-4 md:p-8 space-y-6'>
        <Skeleton className='h-24 w-full' />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-24 w-full' />
        </div>
        <Skeleton className='h-20 w-full' />
        <Skeleton className='h-[70vh] w-full' />
      </div>
    )
  }

  if (appointmentsError) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-destructive'>Lỗi tải dữ liệu</h3>
          <p className='text-muted-foreground'>{appointmentsError?.message || 'Không thể kết nối đến máy chủ.'}</p>
          <Button variant='outline' onClick={() => refetchAppointments()} className='mt-4'>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-background'>
      <main className='container mx-auto max-w-screen-2xl space-y-6 p-4 md:p-8'>
        <header className='relative overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-md'>
          <div className='p-6 md:p-8'>
            <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
              <div className='flex items-center gap-4'>
                <div className='rounded-lg bg-primary/20 p-3'>
                  <CalendarDays className='h-8 w-8' />
                </div>
                <div>
                  <h1 className='text-2xl font-bold md:text-3xl'>Quản lý Lịch hẹn</h1>
                  <p className='text-sm text-primary-foreground/80'>Theo dõi và quản lý lịch hẹn hiệu quả.</p>
                </div>
              </div>
              <div className='text-left sm:text-right'>
                <p className='text-sm font-medium'>Hôm nay</p>
                <p className='text-xl font-bold'>{format(new Date(), 'dd/MM/yyyy')}</p>
              </div>
            </div>
          </div>
        </header>

        <section className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <AppointmentStatsCards stats={stats} isLoading={isLoadingAppointments} />
        </section>

        <section className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <AppointmentToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onCreateAppointment={handleCreateAppointment}
          />
        </section>

        <section className='rounded-lg border bg-card text-card-foreground shadow-sm'>
          <AppointmentCalendarView
            appointments={appointments}
            isLoading={isLoadingAppointments}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onViewDetail={handleViewDetail}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onCancel={handleCancel}
          />
        </section>

        <AppointmentDetailSheet
          appointment={selectedAppointment}
          isOpen={isDetailSheetOpen}
          onClose={handleCloseDetailSheet}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onCancel={handleCancel}
        />

        <ConfirmActionDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCloseConfirmDialog}
          onConfirm={handleConfirmAction}
          title={confirmDialog.title}
          description={confirmDialog.description}
          action={confirmDialog.type || 'cancel'}
          isLoading={isAnyMutationLoading}
        />
      </main>
    </div>
  )
}

export default ManageAppointmentPage
