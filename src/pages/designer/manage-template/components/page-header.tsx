import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  onCreateTemplate: () => void
  onImport: () => void
  onExport: () => void
  onSettings: () => void
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onCreateTemplate }) => {
  return (
    <div className='bg-background border rounded-lg p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Quản lý Template Đầm Bầu</h1>
          <p className='text-muted-foreground mt-2'>Thiết kế và tổ chức các template đầm theo styles cho mẹ bầu</p>
        </div>

        <div className='flex items-center gap-3'>
          <Button onClick={onCreateTemplate}>
            <Plus className='w-4 h-4 mr-2' />
            Tạo mẫu đầm bầu mới
          </Button>
        </div>
      </div>
    </div>
  )
}
