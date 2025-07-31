import React from 'react'
import { DressTemplate, ViewMode } from '@/@types/designer.types'
import { StyleGroup } from './style-group'

interface StyleGroupGridProps {
  groupedByStyle: Record<string, { styleName: string; templates: DressTemplate[] }>
  viewMode: ViewMode
  onEdit: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

export const StyleGroupGrid: React.FC<StyleGroupGridProps> = ({
  groupedByStyle,
  viewMode,
  onEdit,
  onPreview,
  onDelete
}) => {
  const styleEntries = Object.entries(groupedByStyle)

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
    <div className='space-y-8'>
      {styleEntries.map(([styleId, { styleName, templates }]) => (
        <StyleGroup
          key={styleId}
          styleName={styleName}
          templates={templates}
          viewMode={viewMode}
          onEdit={onEdit}
          onPreview={onPreview}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
