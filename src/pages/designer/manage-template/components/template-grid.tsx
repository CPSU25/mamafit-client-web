import React from 'react'
import { DressTemplate, ViewMode } from '@/@types/designer.types'
import { TemplateCard } from './template-card'

interface TemplateGridProps {
  templates: DressTemplate[]
  viewMode: ViewMode
  onEdit: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, viewMode, onEdit, onPreview, onDelete }) => {
  if (templates.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='text-muted-foreground mb-4'>
          <div className='w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center'>
            <svg className='w-8 h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
        </div>
        <h3 className='text-lg font-medium text-foreground mb-2'>Không tìm thấy template nào</h3>
        <p className='text-muted-foreground'>Thử điều chỉnh bộ lọc hoặc tạo template mới</p>
      </div>
    )
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} onEdit={onEdit} onPreview={onPreview} onDelete={onDelete} />
      ))}
    </div>
  )
}
