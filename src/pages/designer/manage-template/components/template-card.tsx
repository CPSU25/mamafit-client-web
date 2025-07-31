import React, { useState } from 'react'
import { Edit2, Eye, Trash2, ChevronDown, ChevronUp, Grid, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ComponentOption, DressTemplate } from '@/@types/designer.types'

interface TemplateCardProps {
  template: DressTemplate
  onEdit: (id: string) => void
  onPreview: (id: string) => void
  onDelete: (id: string) => void
}

const ComponentOptionItem: React.FC<{ option: ComponentOption }> = ({ option }) => (
  <div className='p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow'>
    <div className='flex items-start justify-between mb-2'>
      <div className='flex-1'>
        <h5 className='font-medium text-sm text-gray-900'>{option.name}</h5>
        <p className='text-xs text-gray-600 mt-1'>{option.description}</p>
      </div>
      <Badge variant='secondary' className='text-xs'>
        {option.componentName}
      </Badge>
    </div>
    <div className='flex items-center justify-between text-xs text-gray-500'>
      <span>Giá: {option.price.toLocaleString('vi-VN')}đ</span>
      <span>ID: {option.componentId.slice(0, 8)}</span>
    </div>
  </div>
)

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onEdit, onPreview, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className='overflow-hidden hover:shadow-md transition-shadow'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              <CardTitle className='text-lg'>#{template.id.slice(0, 8)}</CardTitle>
              <Badge variant={template.type === 'SYSTEM' ? 'default' : 'secondary'}>{template.type}</Badge>
              {template.isDefault && (
                <Badge variant='outline' className='text-green-600 border-green-600'>
                  Mặc định
                </Badge>
              )}
            </div>
            <div className='space-y-1 text-sm text-muted-foreground'>
              <p>Style: {template.styleName}</p>
              <p>Giá cơ bản: {template.price.toLocaleString('vi-VN')}đ</p>
              <p>Tạo: {new Date(template.createdAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <div className='flex items-center gap-1'>
            <Button size='sm' variant='ghost' onClick={() => onPreview(template.id)}>
              <Eye className='w-4 h-4' />
            </Button>
            <Button size='sm' variant='ghost' onClick={() => onEdit(template.id)}>
              <Edit2 className='w-4 h-4' />
            </Button>
            <Button size='sm' variant='ghost' onClick={() => onDelete(template.id)}>
              <Trash2 className='w-4 h-4 text-destructive' />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Template Image */}
          <div className='space-y-3'>
            <div className='aspect-[3/4] bg-muted rounded-lg overflow-hidden'>
              {template.images && template.images.length > 0 ? (
                <img
                  src={template.images[0]}
                  alt={`Template ${template.id}`}
                  className='w-full h-full object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className='w-full h-full flex items-center justify-center'>
                <ImageIcon className='h-12 w-12 text-muted-foreground' />
              </div>
            </div>
          </div>

          {/* Component Options */}
          <div className='space-y-3'>
            {template.componentOptions && template.componentOptions.length > 0 ? (
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-medium flex items-center gap-2'>
                    <Grid className='h-4 w-4' />
                    Component Options ({template.componentOptions.length})
                  </h4>
                  <Button variant='ghost' size='sm' onClick={() => setShowDetails(!showDetails)}>
                    {showDetails ? (
                      <>
                        Thu gọn <ChevronUp className='w-4 h-4 ml-1' />
                      </>
                    ) : (
                      <>
                        Chi tiết <ChevronDown className='w-4 h-4 ml-1' />
                      </>
                    )}
                  </Button>
                </div>

                <div className='space-y-2'>
                  {template.componentOptions.slice(0, showDetails ? undefined : 2).map((option) => (
                    <ComponentOptionItem key={option.id} option={option} />
                  ))}
                </div>

                {!showDetails && template.componentOptions.length > 2 && (
                  <p className='text-xs text-muted-foreground text-center'>
                    +{template.componentOptions.length - 2} options khác
                  </p>
                )}
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <Grid className='h-8 w-8 mx-auto mb-2' />
                <p className='text-sm'>Chưa có component options</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
