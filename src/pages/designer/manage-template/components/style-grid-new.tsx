import React from 'react'
import { DressTemplate } from '@/@types/designer.types'
import { StyleCard } from './style-card'

interface StyleGridProps {
  groupedByStyle: Record<string, { styleName: string; templates: DressTemplate[] }>
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView?: (id: string) => void
}

export const StyleGrid: React.FC<StyleGridProps> = ({ groupedByStyle, onEdit, onDelete, onView }) => {
  // Debug: kiểm tra onView prop
  console.log('StyleGrid rendered with onView:', !!onView)

  const styleEntries = Object.entries(groupedByStyle)

  const handlePreviewTemplate = (template: DressTemplate) => {
    console.log('handlePreviewTemplate called with template:', template.id)
    if (onView) {
      console.log('Calling onView with id:', template.id)
      onView(template.id)
    } else {
      console.log('onView not provided')
    }
  }

  if (styleEntries.length === 0) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <p className='text-muted-foreground'>Không có template nào để hiển thị</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {styleEntries.map(([styleId, { styleName, templates }]) => (
        <StyleCard
          key={styleId}
          styleName={styleName}
          templates={templates}
          onPreviewTemplate={handlePreviewTemplate}
          onEditTemplate={onEdit}
          onDeleteTemplate={onDelete}
        />
      ))}
    </div>
  )
}
