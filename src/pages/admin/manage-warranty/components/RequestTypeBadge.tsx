import { Badge } from '@/components/ui/badge'
import { requestTypeConfig } from '../constants'
import { RequestType } from '@/@types/warranty-request.types'

export const RequestTypeBadge = ({ type }: { type: RequestType }) => {
  const config = requestTypeConfig[type] ?? {
    label: String(type ?? 'Không xác định'),
    color:
      'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800'
  }

  return (
    <Badge variant='outline' className={`${config.color} border`}>
      {config.label}
    </Badge>
  )
}
