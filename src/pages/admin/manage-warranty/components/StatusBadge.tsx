import { Badge } from '@/components/ui/badge'
import { statusConfig } from '../constants'
import { StatusWarrantyRequest } from '@/@types/warranty-request.types'
import { Clock } from 'lucide-react'

export const StatusBadge = ({ status }: { status: StatusWarrantyRequest }) => {
  const fallback = {
    label: String(status ?? 'Không xác định'),
    color:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800',
    icon: Clock
  }
  const config = status ? (statusConfig[status] ?? fallback) : fallback
  const Icon = config.icon

  return (
    <Badge variant='outline' className={`${config.color} border`}>
      <Icon className='w-3 h-3 mr-1' />
      {config.label}
    </Badge>
  )
}
