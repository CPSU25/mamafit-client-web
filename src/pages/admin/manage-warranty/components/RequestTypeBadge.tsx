import { Badge } from '@/components/ui/badge'
import { requestTypeConfig } from '../constants'
import { RequestType } from '@/@types/warranty-request.types'

export const RequestTypeBadge = ({ type }: { type: RequestType }) => {
  const config = requestTypeConfig[type] ?? {
    label: String(type ?? 'Không xác định'),
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <Badge variant='outline' className={`${config.color} border`}>
      {config.label}
    </Badge>
  )
}
