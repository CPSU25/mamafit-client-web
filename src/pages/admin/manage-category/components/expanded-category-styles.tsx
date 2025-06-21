import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Plus, Trash2, Package, Info, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useStylesByCategory, useCreateStyle, useDeleteStyle } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { StyleFormData, StyleType } from '@/@types/inventory.type'

interface ExpandedCategoryStylesProps {
  categoryId: string
}

export const ExpandedCategoryStyles = React.memo(function ExpandedCategoryStyles({
  categoryId
}: ExpandedCategoryStylesProps) {
  const [activeTab, setActiveTab] = useState('styles')
  const [showAddForm, setShowAddForm] = useState(false)

  // React Query hooks with optimized parameters
  const queryParams = useMemo(
    () => ({
      index: 1,
      pageSize: 10,
      sortBy: 'createdat_desc' as const
    }),
    []
  )

  const {
    data: stylesData,
    isLoading: stylesLoading,
    error: stylesError
  } = useStylesByCategory(categoryId, queryParams)
  const createStyleMutation = useCreateStyle()
  const deleteStyleMutation = useDeleteStyle()

  const form = useForm<StyleFormData>({
    defaultValues: {
      categoryId: categoryId,
      name: '',
      isCustom: false,
      description: '',
      images: []
    }
  })

  // Reset form when categoryId changes
  useEffect(() => {
    form.reset({
      categoryId: categoryId,
      name: '',
      isCustom: false,
      description: '',
      images: []
    })
    setShowAddForm(false)
  }, [categoryId, form])

  const handleAddStyle = useCallback(
    async (data: StyleFormData) => {
      try {
        await createStyleMutation.mutateAsync(data)
        toast.success('Thêm style thành công!')
        setShowAddForm(false)
        form.reset({
          categoryId: categoryId,
          name: '',
          isCustom: false,
          description: '',
          images: []
        })
      } catch (error) {
        console.error('Error adding style:', error)
        toast.error('Có lỗi xảy ra khi thêm style')
      }
    },
    [createStyleMutation, categoryId, form]
  )

  const handleDeleteStyle = useCallback(
    async (styleId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await deleteStyleMutation.mutateAsync(styleId)
        toast.success('Xóa style thành công!')
      } catch (error) {
        console.error('Error deleting style:', error)
        toast.error('Có lỗi xảy ra khi xóa style')
      }
    },
    [deleteStyleMutation]
  )

  const handleToggleAddForm = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setShowAddForm((prev) => {
      if (!prev) {
        // Reset mutations when opening form
        createStyleMutation.reset()
      }
      return !prev
    })
  }, [createStyleMutation])

  if (!categoryId) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <Package className='h-16 w-16 text-gray-300' />
          <p className='text-muted-foreground'>Chọn một danh mục để xem styles</p>
        </div>
      </div>
    )
  }

  const styles = stylesData?.data.items || []

  return (
    <div className='bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border-t border-blue-100'>
      <div className='p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2 bg-white shadow-sm border border-gray-200 rounded-xl p-1'>
            <TabsTrigger
              value='styles'
              className='flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all'
            >
              <Settings className='h-4 w-4' aria-hidden="true" />
              Styles ({styles.length})
            </TabsTrigger>
            <TabsTrigger
              value='info'
              className='flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition-all'
            >
              <Info className='h-4 w-4' aria-hidden="true" />
              Thông tin
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Styles */}
          <TabsContent value='styles' className='space-y-4'>
            <Card className='border-0 shadow-lg bg-white'>
              <CardHeader className='bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg py-3'>
                <CardTitle className='flex items-center justify-between text-lg'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-5 w-5' aria-hidden="true" />
                    Danh Sách Styles ({styles.length})
                  </div>
                  <Button
                    size='sm'
                    onClick={handleToggleAddForm}
                    disabled={createStyleMutation.isPending}
                    className='bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
                    data-action-button="true"
                  >
                    {showAddForm ? (
                      <>
                        <X className='h-4 w-4 mr-2' aria-hidden="true" />
                        Đóng Form
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4 mr-2' aria-hidden="true" />
                        Thêm Style
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                {showAddForm && (
                  <Card className='mb-4 border-2 border-dashed border-blue-200 bg-blue-50/30'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base text-blue-800 flex items-center gap-2'>
                        <Plus className='h-4 w-4' aria-hidden="true" />
                        Thêm Style Mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddStyle)} className='space-y-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField
                              control={form.control}
                              name='name'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-gray-700'>Tên Style *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VD: Style vintage'
                                      className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                      disabled={createStyleMutation.isPending}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className='flex items-center space-x-2 pt-6'>
                              <FormField
                                control={form.control}
                                name='isCustom'
                                render={({ field }) => (
                                  <FormItem className='flex items-center space-x-2'>
                                    <FormControl>
                                      <Checkbox 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange}
                                        disabled={createStyleMutation.isPending}
                                      />
                                    </FormControl>
                                    <FormLabel className='text-sm text-gray-700 cursor-pointer'>
                                      Style tùy chỉnh
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-gray-700'>Mô tả</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder='Mô tả về style...'
                                    rows={3}
                                    className='border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    disabled={createStyleMutation.isPending}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='flex gap-2'>
                            <Button
                              type='submit'
                              disabled={createStyleMutation.isPending}
                              className='bg-blue-600 hover:bg-blue-700 text-white'
                            >
                              {createStyleMutation.isPending ? (
                                <>
                                  <Loader2 className='animate-spin h-4 w-4 mr-2' aria-hidden="true" />
                                  Đang tạo...
                                </>
                              ) : (
                                <>
                                  <Plus className='h-4 w-4 mr-2' aria-hidden="true" />
                                  Tạo Style
                                </>
                              )}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAddForm(false)
                              }}
                              disabled={createStyleMutation.isPending}
                              className='border-gray-300 hover:bg-gray-50'
                            >
                              Hủy
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {stylesError ? (
                  <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm'>
                    {stylesError instanceof Error
                      ? stylesError.message
                      : typeof stylesError === 'string'
                        ? stylesError
                        : 'Có lỗi xảy ra khi tải styles'}
                  </div>
                ) : null}

                {stylesLoading ? (
                  <div className='text-center py-8'>
                    <div className='flex flex-col items-center gap-2'>
                      <Loader2 className='animate-spin h-6 w-6 text-blue-600' aria-hidden="true" />
                      <p className='text-muted-foreground text-sm'>Đang tải styles...</p>
                    </div>
                  </div>
                ) : styles.length === 0 ? (
                  <div className='text-center py-8'>
                    <Package className='h-12 w-12 mx-auto mb-3 text-gray-300' aria-hidden="true" />
                    <h4 className='text-base font-medium text-gray-900 mb-1'>Chưa có style nào</h4>
                    <p className='text-gray-500 text-sm'>Danh mục này chưa có style nào được tạo</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {styles.map((style: StyleType) => (
                      <Card
                        key={`style-${style.id}`}
                        className='relative group hover:shadow-md transition-shadow border border-gray-200'
                      >
                        <CardContent className='p-3'>
                          <div className='flex items-start justify-between mb-2'>
                            <h4 className='font-semibold text-gray-900 text-sm'>{style.name}</h4>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={(e) => handleDeleteStyle(style.id, e)}
                              disabled={deleteStyleMutation.isPending}
                              className='h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                              aria-label={`Xóa style ${style.name}`}
                              data-action-button="true"
                            >
                              <Trash2 className='h-3 w-3' aria-hidden="true" />
                            </Button>
                          </div>

                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-gray-500'>ID:</span>
                              <Badge variant='outline' className='text-xs font-mono'>
                                {style.id.slice(-6)}
                              </Badge>
                            </div>
                            {style.isCustom && (
                              <div className='flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>Loại:</span>
                                <Badge variant='secondary' className='text-xs'>
                                  Tùy chỉnh
                                </Badge>
                              </div>
                            )}
                          </div>

                          {style.description && (
                            <div className='pt-2 mt-2 border-t border-gray-100'>
                              <p className='text-xs text-gray-600 line-clamp-2'>{style.description}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='info' className='space-y-4'>
            <Card className='border-0 shadow-lg bg-white'>
              <CardHeader className='bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg py-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Info className='h-5 w-5' aria-hidden="true" />
                  Thông Tin Danh Mục
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='p-3 bg-blue-50 rounded-lg'>
                    <span className='text-xs font-medium text-blue-600 uppercase tracking-wide'>Tổng styles</span>
                    <p className='text-lg font-bold text-blue-700 mt-1'>{styles.length}</p>
                  </div>
                  <div className='p-3 bg-purple-50 rounded-lg'>
                    <span className='text-xs font-medium text-purple-600 uppercase tracking-wide'>
                      Styles tùy chỉnh
                    </span>
                    <p className='text-lg font-bold text-purple-700 mt-1'>
                      {styles.filter((s: StyleType) => s.isCustom).length}
                    </p>
                  </div>
                  <div className='p-3 bg-green-50 rounded-lg'>
                    <span className='text-xs font-medium text-green-600 uppercase tracking-wide'>Có hình ảnh</span>
                    <p className='text-lg font-bold text-green-700 mt-1'>
                      {styles.filter((s: StyleType) => s.image && s.image.length > 0).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
})
