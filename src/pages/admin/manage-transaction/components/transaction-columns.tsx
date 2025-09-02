// transaction-columns.tsx - Enhanced Table Columns for Transaction
import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Hash, Calendar, FileText, Building } from 'lucide-react'
import { Transaction } from '../data/schema'
import LongText from '@/components/long-text'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import { cn } from '@/lib/utils/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '../../components/data-table-column-header'
// import { TransactionTableRowActions } from './transaction-row-action'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Enhanced Gateway Icon Component
function GatewayIcon({ gateway }: { gateway: string }) {
  const getGatewayInfo = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case 'gift card':
        return {
          icon: '🎁',
          color: 'from-pink-500 to-pink-600',
          bgColor: 'from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-950/30'
        }
      case 'coupon':
        return {
          icon: '🎫',
          color: 'from-orange-500 to-orange-600',
          bgColor: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-950/30'
        }
      case 'cod':
        return {
          icon: '💵',
          color: 'from-green-500 to-green-600',
          bgColor: 'from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-950/30'
        }
      case 'upi':
        return {
          icon: '📱',
          color: 'from-blue-500 to-blue-600',
          bgColor: 'from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-950/30'
        }
      case 'debit card':
        return {
          icon: '💳',
          color: 'from-purple-500 to-purple-600',
          bgColor: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-950/30'
        }
      case 'cash':
        return {
          icon: '💰',
          color: 'from-yellow-500 to-yellow-600',
          bgColor: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-yellow-950/30'
        }
      default:
        return {
          icon: '🏦',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'from-gray-100 to-gray-50 dark:from-gray-900/30 dark:to-gray-950/30'
        }
    }
  }

  const { icon, bgColor } = getGatewayInfo(gateway)

  return (
    <div
      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${bgColor} flex items-center justify-center border-2 border-violet-200 dark:border-violet-800 shadow-sm`}
    >
      <span className='text-lg'>{icon}</span>
    </div>
  )
}

// Function to format currency
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Function to get gateway badge color
function getGatewayBadgeColor(gateway: string) {
  switch (gateway.toLowerCase()) {
    case 'gift card':
      return 'bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 shadow-sm'
    case 'coupon':
      return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-sm'
    case 'cod':
      return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm'
    case 'upi':
      return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-sm'
    case 'debit card':
      return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm'
    case 'cash':
      return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-sm'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px] border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
        data-action-button='true'
      />
    ),
    meta: {
      className: cn(
        'sticky md:table-cell left-0 z-10 rounded-tl w-12',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30'
      )
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px] border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
        data-action-button='true'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Mã Giao Dịch'
        className='text-violet-700 dark:text-violet-300 font-semibold'
      />
    ),
    cell: ({ row }) => {
      const orderId = row.getValue('code') as string
      const sepayId = row.original.sepayId

      return (
        <div className='flex items-center gap-3'>
          <div className='flex flex-col'>
            <span className='font-semibold text-foreground'>{orderId}</span>
            <span className='text-xs text-muted-foreground flex items-center gap-1'>
              <Hash className='h-3 w-3' />
              {sepayId}
            </span>
          </div>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)] lg:drop-shadow-none',
        'bg-background transition-colors duration-200 group-hover/row:bg-violet-50/50 dark:group-hover/row:bg-violet-950/20 group-data-[state=selected]/row:bg-violet-50 dark:group-data-[state=selected]/row:bg-violet-950/30',
        'sticky left-12 md:table-cell'
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'gateway',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Phương Thức' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const gateway = row.getValue('gateway') as string

      return (
        <div className='flex items-center gap-3'>
          <GatewayIcon gateway={gateway} />
          <div className='flex flex-col'>
            <Badge className={cn('font-semibold', getGatewayBadgeColor(gateway))}>{gateway}</Badge>
          </div>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'transferAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số Tiền' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('transferAmount') as number

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-2'>
                <span className='font-bold text-green-600 text-lg'>{formatCurrency(amount)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-sm'>Số tiền giao dịch: {amount.toLocaleString()} VNĐ</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'accountNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số Tài Khoản' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const accountNumber = row.getValue('accountNumber') as string

      return (
        <div className='flex items-center gap-2'>
          <Building className='h-4 w-4 text-violet-500' />
          <span className='font-mono text-sm font-medium'>{accountNumber}</span>
        </div>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'content',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nội Dung' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const content = row.getValue('content') as string

      if (!content) {
        return (
          <span className='text-muted-foreground italic flex items-center gap-1'>
            <FileText className='h-3 w-3' />
            Chưa có nội dung
          </span>
        )
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='max-w-xs'>
                <LongText className='text-sm line-clamp-2'>{content}</LongText>
              </div>
            </TooltipTrigger>
            <TooltipContent className='max-w-sm'>
              <p className='text-sm'>{content}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableHiding: false
  },
  {
    accessorKey: 'transactionDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày Giao Dịch' className='text-violet-700 dark:text-violet-300' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('transactionDate') as string
      const formattedDate = dayjs(date).format('DD/MM/YYYY HH:mm')
      const relativeTime = dayjs(date).fromNow()

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-2 text-sm'>
                <Calendar className='h-4 w-4 text-violet-500' />
                <div className='flex flex-col'>
                  <span className='font-medium'>{formattedDate}</span>
                  <span className='text-xs text-muted-foreground'>{relativeTime}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className='text-xs'>Giao dịch vào lúc {formattedDate}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => (
  //     <div data-action-button='true'>
  //       <TransactionTableRowActions row={row} />
  //     </div>
  //   )
  // }
]
