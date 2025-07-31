import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { CheckCircle, LogOut, XCircle } from 'lucide-react'

interface ConfirmActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  action: 'check-in' | 'check-out' | 'cancel'
  isLoading?: boolean
}

export const ConfirmActionDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  action,
  isLoading = false
}: ConfirmActionDialogProps) => {
  const getActionConfig = () => {
    switch (action) {
      case 'check-in':
        return {
          icon: CheckCircle,
          buttonText: 'Check-in',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
          iconColor: 'text-green-600'
        }
      case 'check-out':
        return {
          icon: LogOut,
          buttonText: 'Check-out',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          iconColor: 'text-blue-600'
        }
      case 'cancel':
        return {
          icon: XCircle,
          buttonText: 'Hủy lịch',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
          iconColor: 'text-red-600'
        }
      default:
        return {
          icon: CheckCircle,
          buttonText: 'Xác nhận',
          buttonClass: 'bg-primary hover:bg-primary/90',
          iconColor: 'text-primary'
        }
    }
  }

  const config = getActionConfig()
  const Icon = config.icon

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center gap-3 mb-2'>
            <div className={`p-3 rounded-full bg-muted ${config.iconColor}`}>
              <Icon className='h-6 w-6' />
            </div>
            <AlertDialogTitle className='text-xl'>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className='text-base'>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading} className={config.buttonClass}>
            {isLoading ? (
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                <span>Đang xử lý...</span>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Icon className='h-4 w-4' />
                <span>{config.buttonText}</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
