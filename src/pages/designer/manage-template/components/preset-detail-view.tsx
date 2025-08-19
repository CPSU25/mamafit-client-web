import React from 'react'
import { ArrowLeft, Package, Tag, Calendar, Loader2, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTemplateDetail } from '@/services/designer/template.service'

interface PresetDetailViewProps {
  presetId: string | null
  onBack: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  showBackButton?: boolean
  compact?: boolean
}

export const PresetDetailView: React.FC<PresetDetailViewProps> = ({
  presetId,
  onBack,
  onEdit,
  onDelete,
  showBackButton = true,
  compact = false
}) => {
  // Fetch preset detail từ API
  const { data: template, isLoading, error } = useTemplateDetail(presetId || '')
  console.log('Preset Detail:', template)
  if (!presetId) return null

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={onBack} className='flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Quay lại
          </Button>
        </div>

        <div className='flex items-center justify-center h-64'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='w-6 h-6 animate-spin' />
            <span>Đang tải chi tiết preset...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={onBack} className='flex items-center gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Quay lại
          </Button>
        </div>

        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <p className='text-red-500 mb-2'>Có lỗi xảy ra khi tải dữ liệu</p>
            <p className='text-sm text-muted-foreground'>
              {error instanceof Error ? error.message : 'Lỗi không xác định'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!template) return null

  const totalComponentPrice = template.componentOptions?.reduce((sum, option) => sum + option.price, 0) || 0
  const totalPrice = template.price + totalComponentPrice

  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-6'}`}>
      {/* Header - ẩn đi khi compact vì đã có header ở parent */}
      {!compact && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            {showBackButton && (
              <Button variant='ghost' onClick={onBack} className='flex items-center gap-2'>
                <ArrowLeft className='w-4 h-4' />
                Quay lại
              </Button>
            )}
            <div>
              <h2 className='text-2xl font-bold'>Chi tiết Preset</h2>
              <p className='text-muted-foreground'>
                #{template.id.slice(0, 8)} - {template.styleName}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            {onEdit && (
              <Button onClick={() => onEdit(template.id)} className='flex items-center gap-2'>
                <Edit className='w-4 h-4' />
                Chỉnh sửa
              </Button>
            )}
            {onDelete && (
              <Button variant='destructive' onClick={() => onDelete(template.id)} className='flex items-center gap-2'>
                <Trash2 className='w-4 h-4' />
                Xóa
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Preset ID và Style Name - luôn hiển thị */}
      <div className='bg-gray-50 rounded-lg p-4 border'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-semibold text-gray-900`}>{template.styleName}</h3>
          </div>
          {/* Action Buttons cho compact mode */}
          {compact && (
            <div className='flex gap-2'>
              {onEdit && (
                <Button size='sm' onClick={() => onEdit(template.id)} className='flex items-center gap-2'>
                  <Edit className='w-3 h-3' />
                  Sửa
                </Button>
              )}
              {onDelete && (
                <Button
                  size='sm'
                  variant='destructive'
                  onClick={() => onDelete(template.id)}
                  className='flex items-center gap-2'
                >
                  <Trash2 className='w-3 h-3' />
                  Xóa
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        {/* Images Section */}
        <div className={`${compact ? '' : 'lg:col-span-1'} space-y-4`}>
          <Card className='overflow-hidden'>
            <CardHeader className='pb-3'>
              <CardTitle className={`${compact ? 'text-base' : 'text-lg'}`}>Hình ảnh Preset</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Main Image */}
              <div
                className={`${compact ? 'aspect-[4/3]' : 'aspect-[3/4]'} bg-gray-100 rounded-lg overflow-hidden mb-3`}
              >
                {template.images && template.images.length > 0 ? (
                  <img
                    src={template.images[0]}
                    alt={`Template ${template.styleName}`}
                    className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                  />
                ) : (
                  <div className='w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400'>
                    <Package className={`${compact ? 'w-8 h-8' : 'w-12 h-12'}`} />
                    <span className='text-sm mt-2'>Chưa có hình ảnh</span>
                  </div>
                )}
              </div>

              {/* Additional Images */}
              {template.images && template.images.length > 1 && (
                <div className={`grid ${compact ? 'grid-cols-3 gap-1' : 'grid-cols-2 gap-2'}`}>
                  {template.images.slice(1, compact ? 4 : 5).map((image, index) => (
                    <div key={index} className='aspect-square bg-gray-100 rounded-md overflow-hidden group'>
                      <img
                        src={image}
                        alt={`Additional view ${index + 1}`}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                      />
                    </div>
                  ))}
                  {template.images.length > (compact ? 4 : 5) && (
                    <div className='aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-xs'>
                      +{template.images.length - (compact ? 4 : 5)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className={`${compact ? '' : 'lg:col-span-2'} space-y-4`}>
          {/* Basic Info - Redesigned for compact */}
          <Card className='overflow-hidden'>
            <CardHeader className=''>
              <CardTitle className={`${compact ? 'text-base' : 'text-lg'} flex items-center gap-2 text-gray-800`}>
                <Tag className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              <div className={`grid ${compact ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                    <span className='text-sm text-gray-600'>Style:</span>
                    <span className='font-medium text-gray-900'>{template.styleName}</span>
                  </div>
                  <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                    <span className='text-sm text-gray-600'>Loại:</span>
                    <Badge variant={template.type === 'SYSTEM' ? 'default' : 'outline'}>{template.type}</Badge>
                  </div>
                  <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                    <span className='text-sm text-gray-600'>Mặc định:</span>
                    <Badge variant={template.isDefault ? 'default' : 'secondary'}>
                      {template.isDefault ? 'Có' : 'Không'}
                    </Badge>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                    <span className='text-sm text-gray-600'>Giá cơ bản:</span>
                    <span className='font-medium text-gray-900'>{template.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                    <span className='text-sm text-gray-600'>Giá components:</span>
                    <span className='font-medium text-gray-900'>{totalComponentPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className='flex justify-between items-center p-3 rounded bg-gradient-to-r from-green-50 to-blue-50 border border-green-200'>
                    <span className='text-sm font-medium text-gray-700'>Tổng giá trị:</span>
                    <span className='font-bold text-primary text-lg'>{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps - Compact design */}
          {!compact && (
            <Card>
              <CardHeader className='bg-gradient-to-r from-orange-50 to-red-50 pb-3'>
                <CardTitle className='text-lg flex items-center gap-2 text-gray-800'>
                  <Calendar className='w-5 h-5' />
                  Thông tin thời gian
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                      <span className='text-sm text-gray-600'>Tạo bởi:</span>
                      <span className='font-medium text-gray-900'>{template.createdBy}</span>
                    </div>
                    <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                      <span className='text-sm text-gray-600'>Ngày tạo:</span>
                      <span className='text-gray-900'>{new Date(template.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                      <span className='text-sm text-gray-600'>Cập nhật bởi:</span>
                      <span className='font-medium text-gray-900'>{template.updatedBy}</span>
                    </div>
                    <div className='flex justify-between items-center p-2 rounded bg-gray-50'>
                      <span className='text-sm text-gray-600'>Lần cuối:</span>
                      <span className='text-gray-900'>{new Date(template.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Component Options */}
          {template.componentOptions && template.componentOptions.length > 0 && (
            <Card>
              <CardHeader className=''>
                <CardTitle className={`${compact ? 'text-base' : 'text-lg'} flex items-center gap-2 text-gray-800`}>
                  <Package className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                  Components & Options ({template.componentOptions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='space-y-6'>
                  {/* Group component options by componentName */}
                  {Object.entries(
                    template.componentOptions.reduce(
                      (acc, option) => {
                        if (!acc[option.componentName]) {
                          acc[option.componentName] = []
                        }
                        acc[option.componentName].push(option)
                        return acc
                      },
                      {} as Record<string, typeof template.componentOptions>
                    )
                  ).map(([componentName, options]) => (
                    <div
                      key={componentName}
                      className='bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-5 border border-gray-200 shadow-sm'
                    >
                      <div className='flex items-center gap-3 mb-4'>
                        <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                          <Package className='w-4 h-4 text-white' />
                        </div>
                        <div>
                          <h4 className='font-bold text-md text-gray-800'>{componentName}</h4>
                          <p className='text-sm text-gray-600'>{options.length} tùy chọn có sẵn</p>
                        </div>
                      </div>

                      <div className='grid gap-3'>
                        {options.map((option) => (
                          <div
                            key={option.id}
                            className='group bg-white rounded-lg p-4 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200'
                          >
                            <div className='flex items-center justify-between'>
                              <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-2'>
                                  <div className='w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full'></div>
                                  <h5 className='font-semibold text-gray-900 group-hover:text-blue-700 transition-colors'>
                                    {option.name}
                                  </h5>
                                  <div className='flex items-center gap-2 ml-auto'>
                                    <Badge
                                      variant='outline'
                                      className='bg-green-50 text-green-700 border-green-200 font-medium'
                                    >
                                      {option.price.toLocaleString('vi-VN')}đ
                                    </Badge>
                                  </div>
                                </div>

                                {option.description && (
                                  <p className='text-sm text-gray-600 mb-3 leading-relaxed'>{option.description}</p>
                                )}

                                <div className='flex items-center justify-between'>
                                  <div className='flex items-center gap-2'>
                                    {option.tag && (
                                      <Badge
                                        variant='secondary'
                                        className='text-xs bg-blue-50 text-blue-700 border-blue-200'
                                      >
                                        {option.tag}
                                      </Badge>
                                    )}
                                  </div>
                                  <span className='text-xs text-gray-400 font-mono'>#{option.id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
