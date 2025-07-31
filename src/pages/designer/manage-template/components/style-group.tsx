import React from 'react'
import { DressTemplate, ViewMode } from '@/@types/designer.types'
import { TemplateCard } from './template-card'

interface StyleGroupProps {
  styleName: string
  templates: DressTemplate[]
  viewMode: ViewMode
  onEdit: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

export const StyleGroup: React.FC<StyleGroupProps> = ({
  styleName,
  templates,
  viewMode,
  onEdit,
  onPreview,
  onDelete
}) => {
  return (
    <div className='space-y-4'>
      {/* Style Header */}
      <div className='border-b pb-2'>
        <h3 className='text-lg font-semibold text-foreground'>Style: {styleName}</h3>
        <p className='text-sm text-muted-foreground'>
          {templates.length} preset{templates.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Templates Grid */}
      <div
        className={
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'
        }
      >
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={onEdit}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}
