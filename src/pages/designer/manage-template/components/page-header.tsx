import React from 'react'
import { Plus, Upload, Download, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  onCreateTemplate: () => void
  onImport: () => void
  onExport: () => void
  onSettings: () => void
}

export const PageHeader: React.FC<PageHeaderProps> = ({ onCreateTemplate, onImport, onExport, onSettings }) => {
  return (
    <div className='bg-background border rounded-lg p-6 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Quản lý Template Đầm Bầu</h1>
          <p className='text-muted-foreground mt-2'>Thiết kế và tổ chức các template đầm theo styles cho mẹ bầu</p>
        </div>

        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={onSettings}>
            <Settings className='w-4 h-4 mr-2' />
            Cài đặt
          </Button>

          <Button variant='outline' onClick={onExport}>
            <Download className='w-4 h-4 mr-2' />
            Xuất dữ liệu
          </Button>

          <Button variant='outline' onClick={onImport}>
            <Upload className='w-4 h-4 mr-2' />
            Nhập dữ liệu
          </Button>

          <Button onClick={onCreateTemplate}>
            <Plus className='w-4 h-4 mr-2' />
            Tạo Template Mới
          </Button>
        </div>
      </div>
    </div>
  )
}
