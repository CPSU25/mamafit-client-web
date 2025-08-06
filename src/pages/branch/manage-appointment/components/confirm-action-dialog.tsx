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
import { Button } from '@/components/ui/button'
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

export const ConfirmActionDialog = ({ isOpen, onClose, onConfirm, title, description, action, isLoading = false }: ConfirmActionDialogProps) => {
  // ----- LOGIC GỐC CỦA BẠN ĐƯỢC GIỮ NGUYÊN -----
  const getActionConfig = () => {
    switch (action) {
      case 'check-in': return { icon: CheckCircle, buttonText: 'Check-in', buttonClass: 'bg-green-500 hover:bg-green-600 text-white', iconClass: 'text-green-500' }
      case 'check-out': return { icon: LogOut, buttonText: 'Check-out', buttonClass: 'bg-sky-500 hover:bg-sky-600 text-white', iconClass: 'text-sky-500' }
      case 'cancel': return { icon: XCircle, buttonText: 'Hủy lịch', buttonClass: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground', iconClass: 'text-destructive' }
      default: return { icon: CheckCircle, buttonText: 'Xác nhận', buttonClass: 'bg-primary hover:bg-primary/90', iconClass: 'text-primary' }
    }
  }

  // ----- GIAO DIỆN ĐƯỢC REFECTOR -----
  const config = getActionConfig()
  const Icon = config.icon

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
            <Icon className={`h-6 w-6 ${config.iconClass}`} />
          </div>
          <div className='text-center space-y-2 mt-4'>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex-col-reverse sm:flex-row sm:justify-center sm:space-x-2'>
          <AlertDialogCancel asChild>
            <Button variant='outline' disabled={isLoading}>Hủy bỏ</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={onConfirm} disabled={isLoading} className={config.buttonClass}>
              {isLoading && <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />}
              {config.buttonText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}