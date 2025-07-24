import { VoucherBatchType } from '@/@types/admin.types'
import { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<VoucherBatchType>[] = [
  {
    accessorKey: 'batchName',
    header: 'Batch Name'
  }
]
