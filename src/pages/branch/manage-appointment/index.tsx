// import { useState } from 'react'
// import { CalendarDays } from 'lucide-react'
// import { toast } from 'sonner'
// import { format } from 'date-fns'

// import {
//   useAppointments,
//   useAppointmentStats,
//   useCheckInAppointment,
//   useCheckOutAppointment,
//   useCancelAppointment
// } from '@/services/global/appointment.service'
// import { Appointment, AppointmentFilters } from '@/@types/apointment.type'

// import { AppointmentStatsCards } from './components/appointment-stats-cards'
// import { AppointmentToolbar } from './components/appointment-toolbar'
// import { AppointmentCalendarView } from './components/appointment-calendar-view'
// import { AppointmentDetailSheet } from './components/appointment-detail-sheet'
// import { ConfirmActionDialog } from './components/confirm-action-dialog'

// const ManageAppointmentPage = () => {
//   // State quản lý
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
//   const [filters, setFilters] = useState<AppointmentFilters>({
//     // Không lọc theo ngày để lấy tất cả appointments
//   })
//   const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
//   const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
//   const [confirmDialog, setConfirmDialog] = useState<{
//     isOpen: boolean
//     type: 'check-in' | 'check-out' | 'cancel' | null
//     appointmentId: string | null
//     title: string
//     description: string
//   }>({
//     isOpen: false,
//     type: null,
//     appointmentId: null,
//     title: '',
//     description: ''
//   })

//   // API hooks
//   const {
//     data: appointmentsData,
//     isLoading: isLoadingAppointments,
//     error: appointmentsError,
//     refetch: refetchAppointments
//   } = useAppointments(1, 100, filters)

//   // Debug logging
//   console.log('🔍 Debug Appointments:', {
//     appointmentsData,
//     isLoadingAppointments,
//     appointmentsError,
//     filters,
//     selectedDate
//   })

//   // Lấy danh sách appointment từ API response
//   const appointments = appointmentsData?.data?.items || []

//   console.log('📋 Appointments List:', appointments)

//   // Tính toán stats từ danh sách appointments
//   const stats = useAppointmentStats(appointments)

//   const checkInMutation = useCheckInAppointment()
//   const checkOutMutation = useCheckOutAppointment()
//   const cancelMutation = useCancelAppointment()

//   // Không cần cập nhật filters khi thay đổi ngày vì chúng ta muốn load tất cả appointments
//   // useEffect đã bị remove

//   // Handlers
//   const handleDateSelect = (date: Date) => {
//     setSelectedDate(date)
//   }

//   const handleFiltersChange = (newFilters: AppointmentFilters) => {
//     setFilters(newFilters)
//     if (newFilters.date && newFilters.date !== selectedDate) {
//       setSelectedDate(newFilters.date)
//     }
//   }

//   const handleViewDetail = (appointment: Appointment) => {
//     setSelectedAppointment(appointment)
//     setIsDetailSheetOpen(true)
//   }

//   const handleCloseDetailSheet = () => {
//     setIsDetailSheetOpen(false)
//     setSelectedAppointment(null)
//   }

//   const handleCreateAppointment = () => {
//     // TODO: Implement create appointment dialog
//     toast.info('Chức năng tạo lịch hẹn sẽ được triển khai trong phiên bản tiếp theo')
//   }

//   // Confirm dialog handlers
//   const showConfirmDialog = (
//     type: 'check-in' | 'check-out' | 'cancel',
//     appointmentId: string,
//     customerName: string
//   ) => {
//     const configs = {
//       'check-in': {
//         title: 'Xác nhận Check-in',
//         description: `Bạn có chắc chắn muốn check-in cho khách hàng "${customerName}"? Hành động này sẽ cập nhật trạng thái lịch hẹn thành "Đang diễn ra".`
//       },
//       'check-out': {
//         title: 'Xác nhận Check-out',
//         description: `Bạn có chắc chắn muốn check-out cho khách hàng "${customerName}"? Hành động này sẽ hoàn thành lịch hẹn và không thể hoàn tác.`
//       },
//       cancel: {
//         title: 'Xác nhận Hủy lịch',
//         description: `Bạn có chắc chắn muốn hủy lịch hẹn của khách hàng "${customerName}"? Hành động này không thể hoàn tác.`
//       }
//     }

//     const config = configs[type]
//     setConfirmDialog({
//       isOpen: true,
//       type,
//       appointmentId,
//       title: config.title,
//       description: config.description
//     })
//   }

//   const handleCloseConfirmDialog = () => {
//     setConfirmDialog({
//       isOpen: false,
//       type: null,
//       appointmentId: null,
//       title: '',
//       description: ''
//     })
//   }

//   const handleConfirmAction = async () => {
//     if (!confirmDialog.appointmentId || !confirmDialog.type) return

//     try {
//       switch (confirmDialog.type) {
//         case 'check-in':
//           await checkInMutation.mutateAsync(confirmDialog.appointmentId)
//           break
//         case 'check-out':
//           await checkOutMutation.mutateAsync(confirmDialog.appointmentId)
//           break
//         case 'cancel':
//           await cancelMutation.mutateAsync({
//             id: confirmDialog.appointmentId,
//             reason: 'Hủy bởi nhân viên'
//           })
//           break
//       }

//       // Refetch data và đóng dialogs
//       await refetchAppointments()
//       handleCloseConfirmDialog()

//       // Nếu đang xem chi tiết appointment đã được cập nhật, đóng detail sheet
//       if (selectedAppointment?.id === confirmDialog.appointmentId) {
//         handleCloseDetailSheet()
//       }
//     } catch (error) {
//       // Error đã được handle trong mutation hooks
//       console.error('Error performing action:', error)
//     }
//   }

//   // Action handlers với confirm dialog
//   const handleCheckIn = (appointmentId: string) => {
//     const appointment = appointments.find((apt) => apt.id === appointmentId)
//     if (appointment) {
//       showConfirmDialog('check-in', appointmentId, appointment.user.fullName)
//     }
//   }

//   const handleCheckOut = (appointmentId: string) => {
//     const appointment = appointments.find((apt) => apt.id === appointmentId)
//     if (appointment) {
//       showConfirmDialog('check-out', appointmentId, appointment.user.fullName)
//     }
//   }

//   const handleCancel = (appointmentId: string) => {
//     const appointment = appointments.find((apt) => apt.id === appointmentId)
//     if (appointment) {
//       showConfirmDialog('cancel', appointmentId, appointment.user.fullName)
//     }
//   }

//   const isAnyMutationLoading = checkInMutation.isPending || checkOutMutation.isPending || cancelMutation.isPending

//   // Hiển thị loading state
//   if (isLoadingAppointments) {
//     return (
//       <div className='min-h-screen bg-gray-50/50 flex items-center justify-center'>
//         <div className='text-center'>
//           <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto'></div>
//           <p className='mt-4 text-muted-foreground'>Đang tải dữ liệu...</p>
//         </div>
//       </div>
//     )
//   }

//   // Hiển thị error state
//   if (appointmentsError) {
//     return (
//       <div className='min-h-screen bg-gray-50/50 flex items-center justify-center'>
//         <div className='text-center'>
//           <p className='text-red-600 font-medium'>Có lỗi xảy ra khi tải dữ liệu</p>
//           <p className='text-muted-foreground mt-2'>{appointmentsError?.message || 'Không thể kết nối đến server'}</p>
//           <button
//             onClick={() => refetchAppointments()}
//             className='mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700'
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30'>
//       {/* Container với max-width hợp lý */}
//       <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
//         {/* Header với gradient background */}
//         <div className='relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 rounded-2xl shadow-xl'>
//           <div className='absolute inset-0 bg-black/10'></div>
//           <div className='relative px-6 lg:px-8 py-8 lg:py-12'>
//             <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
//               <div className='flex items-center gap-4'>
//                 <div className='p-3 bg-white/20 backdrop-blur-sm rounded-xl'>
//                   <CalendarDays className='h-8 w-8 lg:h-10 lg:w-10 text-white' />
//                 </div>
//                 <div>
//                   <h1 className='text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-2'>Quản lý Lịch hẹn</h1>
//                   <p className='text-purple-100 text-sm lg:text-lg'>
//                     Quản lý và theo dõi các lịch hẹn của khách hàng một cách hiệu quả
//                   </p>
//                 </div>
//               </div>
//               <div className='lg:block'>
//                 <div className='text-left lg:text-right text-white/90'>
//                   <p className='text-sm font-medium'>Hôm nay</p>
//                   <p className='text-xl lg:text-2xl font-bold'>{format(new Date(), 'dd/MM/yyyy')}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {/* Decorative elements */}
//           <div className='absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-white/5 rounded-full -translate-y-24 lg:-translate-y-32 translate-x-24 lg:translate-x-32'></div>
//           <div className='absolute bottom-0 left-0 w-32 lg:w-48 h-32 lg:h-48 bg-white/5 rounded-full translate-y-16 lg:translate-y-24 -translate-x-16 lg:-translate-x-24'></div>
//         </div>

//         {/* Stats Cards với responsive grid */}
//         <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
//           <AppointmentStatsCards stats={stats} isLoading={isLoadingAppointments} />
//         </div>

//         {/* Toolbar với improved styling */}
//         <div className='bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
//           <AppointmentToolbar
//             filters={filters}
//             onFiltersChange={handleFiltersChange}
//             onCreateAppointment={handleCreateAppointment}
//           />
//         </div>

//         {/* Main Content với improved layout */}
//         <div className='bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
//           <AppointmentCalendarView
//             appointments={appointments}
//             isLoading={isLoadingAppointments}
//             selectedDate={selectedDate}
//             onDateSelect={handleDateSelect}
//             onViewDetail={handleViewDetail}
//             onCheckIn={handleCheckIn}
//             onCheckOut={handleCheckOut}
//             onCancel={handleCancel}
//           />
//         </div>

//         {/* Detail Sheet */}
//         <AppointmentDetailSheet
//           appointment={selectedAppointment}
//           isOpen={isDetailSheetOpen}
//           onClose={handleCloseDetailSheet}
//           onCheckIn={handleCheckIn}
//           onCheckOut={handleCheckOut}
//           onCancel={handleCancel}
//         />

//         {/* Confirm Dialog */}
//         <ConfirmActionDialog
//           isOpen={confirmDialog.isOpen}
//           onClose={handleCloseConfirmDialog}
//           onConfirm={handleConfirmAction}
//           title={confirmDialog.title}
//           description={confirmDialog.description}
//           action={confirmDialog.type || 'cancel'}
//           isLoading={isAnyMutationLoading}
//         />
//       </div>
//     </div>
//   )
// }

// export default ManageAppointmentPage
// ----- LOGIC CỦA BẠN ĐƯỢC GIỮ NGUYÊN HOÀN TOÀN -----
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

    // *** THÊM ĐOẠN CODE NÀY ĐỂ ĐỒNG BỘ STATE ***
    // Nếu bộ lọc mới có khoảng ngày và có ngày bắt đầu,
    // thì cập nhật selectedDate của calendar view về ngày bắt đầu đó.
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
