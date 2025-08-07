import { useState, useCallback, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Loader2,
  Plus,
  Trash2,
  Package,
  Info,
  X,
  Palette,
  Hash,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  Edit2,
  Save,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useStylesByCategory, useCreateStyle, useDeleteStyle } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { StyleFormData, StyleType } from '@/@types/inventory.type'
import { cn } from '@/lib/utils/utils'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ExpandedCategoryStylesProps {
  categoryId: string
}

export const ExpandedCategoryStyles = ({ categoryId }: ExpandedCategoryStylesProps) => {
  const [activeTab, setActiveTab] = useState('styles')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])

  const queryParams = useMemo(
    () => ({
      index: 1,
      pageSize: 10
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
        toast.success('Thêm style thành công!', {
          description: `Style "${data.name}" đã được tạo.`
        })
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
        toast.error('Không thể thêm style', {
          description: 'Vui lòng thử lại sau.'
        })
      }
    },
    [createStyleMutation, categoryId, form]
  )

  const handleDeleteStyle = useCallback(
    async (styleId: string, styleName: string, e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await deleteStyleMutation.mutateAsync(styleId)
        toast.success('Xóa style thành công!', {
          description: `Style "${styleName}" đã được xóa.`
        })
        setSelectedStyles((prev) => prev.filter((id) => id !== styleId))
      } catch (error) {
        console.error('Error deleting style:', error)
        toast.error('Không thể xóa style', {
          description: 'Vui lòng thử lại sau.'
        })
      }
    },
    [deleteStyleMutation]
  )

  const handleToggleAddForm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowAddForm((prev) => {
        if (!prev) {
          createStyleMutation.reset()
        }
        return !prev
      })
    },
    [createStyleMutation]
  )

  const handleSelectStyle = (styleId: string) => {
    setSelectedStyles((prev) => (prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]))
  }

  if (!categoryId) {
    return (
      <div className='p-12 text-center bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-20 w-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
            <Package className='h-10 w-10 text-violet-500' />
          </div>
          <div>
            <p className='text-lg font-medium text-foreground'>Chọn một danh mục</p>
            <p className='text-sm text-muted-foreground'>để xem và quản lý các styles</p>
          </div>
        </div>
      </div>
    )
  }

  const styles: StyleType[] = Array.isArray(stylesData?.data?.items) ? stylesData.data.items : []
  const customStylesCount = styles.filter((s: StyleType) => s.isCustom).length
  const stylesWithImages = styles.filter((s: StyleType) => s.images && s.images.length > 0).length

  return (
    <div className='bg-gradient-to-br from-violet-50/50 via-background to-violet-100/30 dark:from-violet-950/20 dark:via-background dark:to-violet-900/20 border-t-2 border-violet-200 dark:border-violet-800'>
      <div className='p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full max-w-md grid-cols-2 bg-white dark:bg-gray-900 shadow-lg border border-violet-200 dark:border-violet-800 rounded-xl p-1'>
            <TabsTrigger
              value='styles'
              className={cn(
                'flex items-center gap-2 rounded-lg transition-all duration-200',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-violet-600',
                'data-[state=active]:text-white data-[state=active]:shadow-md'
              )}
            >
              <Palette className='h-4 w-4' />
              <span className='font-semibold'>Styles</span>
              <Badge
                variant='secondary'
                className={cn(
                  'ml-1 text-xs',
                  activeTab === 'styles'
                    ? 'bg-white/20 text-white'
                    : 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                )}
              >
                {styles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value='info'
              className={cn(
                'flex items-center gap-2 rounded-lg transition-all duration-200',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-violet-600',
                'data-[state=active]:text-white data-[state=active]:shadow-md'
              )}
            >
              <Info className='h-4 w-4' />
              <span className='font-semibold'>Thông tin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='styles' className='space-y-6 mt-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Palette className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-foreground'>Danh sách Styles</h3>
                  <p className='text-sm text-muted-foreground'>Quản lý các style của danh mục này</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {selectedStyles.length > 0 && (
                  <Badge
                    variant='secondary'
                    className='bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
                  >
                    {selectedStyles.length} đã chọn
                  </Badge>
                )}
                <Button
                  size='default'
                  onClick={handleToggleAddForm}
                  disabled={createStyleMutation.isPending}
                  className={cn(
                    'relative overflow-hidden',
                    showAddForm
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white',
                    'shadow-md hover:shadow-lg transition-all duration-300'
                  )}
                  data-action-button='true'
                >
                  {showAddForm ? (
                    <>
                      <X className='h-4 w-4 mr-2' />
                      Đóng
                    </>
                  ) : (
                    <>
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm Style
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showAddForm && (
              <Card className='border-2 border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-950/20 shadow-xl'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg flex items-center gap-2 text-violet-700 dark:text-violet-300'>
                    <Sparkles className='h-5 w-5' />
                    Tạo Style Mới
                  </CardTitle>
                  <CardDescription>Điền thông tin để tạo style mới cho danh mục này</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddStyle)} className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground font-semibold'>
                                Tên Style <span className='text-red-500'>*</span>
                              </FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <Palette className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-500' />
                                  <Input
                                    placeholder='VD: Style vintage, Style hiện đại...'
                                    className='pl-10 border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                                    disabled={createStyleMutation.isPending}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='flex items-end pb-2'>
                          <FormField
                            control={form.control}
                            name='isCustom'
                            render={({ field }) => (
                              <FormItem className='flex items-center space-x-3 rounded-lg border border-violet-200 dark:border-violet-800 p-4 bg-white dark:bg-gray-900'>
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={createStyleMutation.isPending}
                                    className='border-violet-300 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600'
                                  />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                  <FormLabel className='text-sm font-medium cursor-pointer'>Style tùy chỉnh</FormLabel>
                                  <p className='text-xs text-muted-foreground'>
                                    Đánh dấu nếu đây là style theo yêu cầu
                                  </p>
                                </div>
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
                            <FormLabel className='text-foreground font-semibold'>Mô tả</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Mô tả chi tiết về style này...'
                                rows={3}
                                className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600 resize-none'
                                disabled={createStyleMutation.isPending}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='flex gap-2 pt-2'>
                        <Button
                          type='submit'
                          disabled={createStyleMutation.isPending}
                          className='bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-md'
                        >
                          {createStyleMutation.isPending ? (
                            <>
                              <Loader2 className='animate-spin h-4 w-4 mr-2' />
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <Save className='h-4 w-4 mr-2' />
                              Lưu Style
                            </>
                          )}
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowAddForm(false)
                            form.reset()
                          }}
                          disabled={createStyleMutation.isPending}
                          className='border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30'
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
              <Card className='border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'>
                <CardContent className='flex items-center gap-3 p-4'>
                  <AlertCircle className='h-5 w-5 text-red-500 flex-shrink-0' />
                  <div>
                    <p className='font-medium text-red-700 dark:text-red-400'>Lỗi khi tải styles</p>
                    <p className='text-sm text-red-600 dark:text-red-300'>
                      {stylesError instanceof Error ? stylesError.message : 'Vui lòng thử lại sau'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {stylesLoading ? (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center space-y-3'>
                  <Loader2 className='animate-spin h-8 w-8 text-violet-500 mx-auto' />
                  <p className='text-muted-foreground'>Đang tải styles...</p>
                </div>
              </div>
            ) : styles.length === 0 ? (
              <Card className='border-2 border-dashed border-violet-200 dark:border-violet-800'>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <div className='h-20 w-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4'>
                    <Package className='h-10 w-10 text-violet-500' />
                  </div>
                  <h4 className='text-lg font-semibold text-foreground mb-2'>Chưa có style nào</h4>
                  <p className='text-sm text-muted-foreground text-center max-w-sm'>
                    Danh mục này chưa có style nào. Hãy thêm style đầu tiên để bắt đầu.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {styles.map((style: StyleType) => (
                  <Card
                    key={`style-${style.id}`}
                    className={cn(
                      'relative group hover:shadow-xl transition-all duration-300 cursor-pointer',
                      'border-2',
                      selectedStyles.includes(style.id)
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700'
                    )}
                    onClick={() => handleSelectStyle(style.id)}
                  >
                    <CardContent className='p-4'>
                      {/* Style Header */}
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center gap-2 flex-1'>
                          <Avatar className='h-10 w-10 border-2 border-violet-200 dark:border-violet-800'>
                            <AvatarFallback className='bg-gradient-to-br from-violet-400 to-violet-600 text-white text-xs font-bold'>
                              {style.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-semibold text-foreground truncate'>{style.name}</h4>
                            <div className='flex items-center gap-1 mt-0.5'>
                              <Hash className='h-3 w-3 text-muted-foreground' />
                              <span className='text-xs text-muted-foreground font-mono'>{style.id.slice(-6)}</span>
                            </div>
                          </div>
                        </div>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={(e) => handleDeleteStyle(style.id, style.name, e)}
                                disabled={deleteStyleMutation.isPending}
                                className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30'
                                data-action-button='true'
                              >
                                <Trash2 className='h-4 w-4 text-red-500' />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xóa style</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className='space-y-2'>
                        {style.isCustom && (
                          <Badge
                            variant='secondary'
                            className='bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs'
                          >
                            Tùy chỉnh
                          </Badge>
                        )}

                        {style.images && style.images.length > 0 && (
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <ImageIcon className='h-3 w-3' />
                            <span>{style.images.length} hình ảnh</span>
                          </div>
                        )}

                        {style.description && (
                          <p className='text-xs text-muted-foreground line-clamp-2 pt-2 border-t'>
                            {style.description}
                          </p>
                        )}
                      </div>

                      {selectedStyles.includes(style.id) && (
                        <div className='absolute top-2 right-2'>
                          <div className='h-6 w-6 rounded-full bg-violet-500 flex items-center justify-center'>
                            <ChevronRight className='h-4 w-4 text-white' />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value='info' className='space-y-6 mt-6'>
            <Card className='border-0 shadow-xl'>
              <CardHeader className='bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-t-lg py-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Info className='h-5 w-5' />
                  Thông Tin Chi Tiết Danh Mục
                </CardTitle>
                <CardDescription className='text-violet-100'>
                  Thống kê và phân tích về các styles trong danh mục này
                </CardDescription>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                  <div className='relative p-4 bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-xl border border-violet-200 dark:border-violet-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide'>
                          Tổng Styles
                        </span>
                        <p className='text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1'>{styles.length}</p>
                      </div>
                      <div className='h-12 w-12 bg-violet-500 rounded-lg flex items-center justify-center'>
                        <Palette className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <div className='mt-3'>
                      <Progress value={(styles.length / 20) * 100} className='h-2' />
                      <p className='text-xs text-muted-foreground mt-1'>Tối đa 20 styles</p>
                    </div>
                  </div>

                  <div className='relative p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-200 dark:border-purple-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide'>
                          Styles Tùy Chỉnh
                        </span>
                        <p className='text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1'>
                          {customStylesCount}
                        </p>
                      </div>
                      <div className='h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center'>
                        <Sparkles className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <div className='mt-3'>
                      <Progress
                        value={styles.length > 0 ? (customStylesCount / styles.length) * 100 : 0}
                        className='h-2'
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        {styles.length > 0 ? Math.round((customStylesCount / styles.length) * 100) : 0}% của tổng số
                      </p>
                    </div>
                  </div>

                  <div className='relative p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-200 dark:border-green-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide'>
                          Có Hình Ảnh
                        </span>
                        <p className='text-2xl font-bold text-green-700 dark:text-green-300 mt-1'>{stylesWithImages}</p>
                      </div>
                      <div className='h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center'>
                        <ImageIcon className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <div className='mt-3'>
                      <Progress
                        value={styles.length > 0 ? (stylesWithImages / styles.length) * 100 : 0}
                        className='h-2'
                      />
                      <p className='text-xs text-muted-foreground mt-1'>
                        {styles.length > 0 ? Math.round((stylesWithImages / styles.length) * 100) : 0}% có hình ảnh
                      </p>
                    </div>
                  </div>
                </div>

                <div className='border-t pt-6'>
                  <h4 className='text-sm font-semibold text-foreground mb-3'>Thao Tác Nhanh</h4>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setActiveTab('styles')}
                      className='border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-950/30'
                    >
                      <Edit2 className='h-4 w-4 mr-2' />
                      Quản lý Styles
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setShowAddForm(true)}
                      disabled={createStyleMutation.isPending}
                      className='border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm Style Mới
                    </Button>
                  </div>
                </div>

                {styles.length > 0 && (
                  <div className='border-t pt-6 mt-6'>
                    <h4 className='text-sm font-semibold text-foreground mb-3'>Styles Gần Đây</h4>
                    <div className='space-y-2'>
                      {styles.slice(0, 3).map((style: StyleType) => (
                        <div key={style.id} className='flex items-center gap-3 p-2 rounded-lg bg-muted/50'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='bg-violet-500 text-white text-xs'>
                              {style.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-foreground'>{style.name}</p>
                            <p className='text-xs text-muted-foreground'>ID: {style.id.slice(-8)}</p>
                          </div>
                          {style.isCustom && (
                            <Badge variant='secondary' className='text-xs'>
                              Tùy chỉnh
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
