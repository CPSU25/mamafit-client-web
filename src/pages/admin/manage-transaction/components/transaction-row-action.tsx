// transaction-row-action.tsx - Row Actions for Transaction Table
import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Download, Copy, RefreshCw } from 'lucide-react'
import { Transaction } from '../data/schema'
import { toast } from 'sonner'

interface TransactionTableRowActionsProps {
  row: Row<Transaction>
}

export function TransactionTableRowActions({ row }: TransactionTableRowActionsProps) {
  const transaction = row.original

  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(transaction.id)
    toast.success('Đã sao chép ID giao dịch')
  }

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(transaction.orderId)
    toast.success('Đã sao chép mã đơn hàng')
  }

  const handleViewDetails = () => {
    toast.info('Xem chi tiết giao dịch (chức năng sẽ được phát triển)')
  }

  const handleDownloadReceipt = () => {
    toast.info('Tải hóa đơn (chức năng sẽ được phát triển)')
  }

  const handleRefresh = () => {
    toast.info('Làm mới trạng thái giao dịch (chức năng sẽ được phát triển)')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted hover:bg-violet-50 dark:hover:bg-violet-950/20'
        >
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[200px]'>
        <DropdownMenuLabel className='text-violet-700 dark:text-violet-300 font-semibold'>
          Thao tác
        </DropdownMenuLabel>
        
        <DropdownMenuItem onClick={handleViewDetails} className='cursor-pointer'>
          <Eye className='mr-2 h-4 w-4' />
          Xem chi tiết
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDownloadReceipt} className='cursor-pointer'>
          <Download className='mr-2 h-4 w-4' />
          Tải hóa đơn
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyTransactionId} className='cursor-pointer'>
          <Copy className='mr-2 h-4 w-4' />
          Sao chép ID giao dịch
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyOrderId} className='cursor-pointer'>
          <Copy className='mr-2 h-4 w-4' />
          Sao chép mã đơn hàng
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleRefresh} className='cursor-pointer'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Làm mới trạng thái
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}