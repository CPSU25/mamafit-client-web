import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Eye, Edit, Trash2, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DressTemplate } from '@/@types/designer.types'

interface StyleCardProps {
  styleName: string
  templates: DressTemplate[]
  onPreviewTemplate: (template: DressTemplate) => void
  onEditTemplate: (id: string) => void
  onDeleteTemplate: (id: string) => void
}

export const StyleCard: React.FC<StyleCardProps> = ({
  styleName,
  templates,
  onPreviewTemplate,
  onEditTemplate,
  onDeleteTemplate
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalPrice = templates.reduce((sum, template) => sum + template.price, 0)
  const systemTemplates = templates.filter((t) => t.type === 'SYSTEM').length
  const userTemplates = templates.filter((t) => t.type === 'USER').length

  return (
    <Card
      className='w-full shadow-sm hover:shadow-md transition-shadow cursor-pointer'
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <Palette className='w-5 h-5 text-primary' />
            </div>
            <div>
              <CardTitle className='text-lg font-semibold'>{styleName}</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {templates.length} preset{templates.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <div className='text-right'>
              <p className='text-sm font-medium'>{totalPrice.toLocaleString('vi-VN')}đ</p>
              <div className='flex gap-1'>
                {systemTemplates > 0 && (
                  <Badge variant='secondary' className='text-xs'>
                    {systemTemplates} System
                  </Badge>
                )}
                {userTemplates > 0 && (
                  <Badge variant='outline' className='text-xs'>
                    {userTemplates} User
                  </Badge>
                )}
              </div>
            </div>

            <Button variant='ghost' size='sm' className='pointer-events-none'>
              {isExpanded ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className='pt-0'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3'>
            {templates.map((template) => (
              <div
                key={template.id}
                className='relative group bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors'
              >
                {/* Template Image */}
                <div className='aspect-[3/4] bg-white rounded-md overflow-hidden mb-2 border'>
                  {template.images && template.images.length > 0 ? (
                    <img src={template.images[0]} alt={`${styleName} preset`} className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-gray-400'>
                      <Palette className='w-8 h-8' />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1'>
                    <Button
                      size='sm'
                      variant='secondary'
                      className='h-7 w-7 p-0'
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreviewTemplate(template)
                      }}
                    >
                      <Eye className='w-3 h-3' />
                    </Button>
                    <Button
                      size='sm'
                      variant='secondary'
                      className='h-7 w-7 p-0'
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditTemplate(template.id)
                      }}
                    >
                      <Edit className='w-3 h-3' />
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='h-7 w-7 p-0'
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteTemplate(template.id)
                      }}
                    >
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  </div>
                </div>

                {/* Template Info */}
                <div className='text-center'>
                  <Badge variant={template.type === 'SYSTEM' ? 'default' : 'outline'} className='text-xs mb-1'>
                    {template.name}
                  </Badge>
                  {template.isDefault && (
                    <Badge variant='outline' className='ml-2 text-xs'>
                      Mặc định
                    </Badge>
                  )}
                  <p className='text-xs text-muted-foreground'>{template.price.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
