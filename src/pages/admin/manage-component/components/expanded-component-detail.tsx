import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Plus, Trash2, Package, Info, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  useComponent,
  useCreateComponentOption,
  useDeleteComponentOption
} from '@/services/admin/manage-component.service'
import { toast } from 'sonner'
import { ComponentOptionType } from '@/@types/admin.types'

interface ExpandedComponentDetailProps {
  componentId: string
}

export const ExpandedComponentDetail = ({ componentId }: ExpandedComponentDetailProps) => {
  const [activeTab, setActiveTab] = useState('options')
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: optionsData, isLoading: optionsLoading, error: optionsError } = useComponent(componentId)
  const createOptionMutation = useCreateComponentOption()
  const deleteOptionMutation = useDeleteComponentOption()

  const form = useForm<{
    name: string
    description: string
    price: number
    tag: { parentTag: string[]; childTag: string[] }
    images: string[]
  }>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      tag: { parentTag: [], childTag: [] },
      images: []
    }
  })

  // Reset form when componentId changes
  useEffect(() => {
    form.reset({
      name: '',
      description: '',
      price: 0,
      tag: { parentTag: [], childTag: [] },
      images: []
    })
    setShowAddForm(false)
  }, [componentId, form])

  const handleAddOption = useCallback(
    async (data: {
      name: string
      description: string
      price: number
      tag: { parentTag: string[]; childTag: string[] }
      images: string[]
    }) => {
      try {
        const optionData = {
          componentId: componentId,
          name: data.name,
          description: data.description,
          price: data.price,
          tag: data.tag, // This is always non-null from form
          images: data.images,
          componentOptionType: 'QUOTATION_PENDING' as const
        }
        await createOptionMutation.mutateAsync(optionData)
        toast.success('Thêm option thành công!')
        setShowAddForm(false)
        form.reset({
          name: '',
          description: '',
          price: 0,
          tag: { parentTag: [], childTag: [] },
          images: []
        })
      } catch (error) {
        console.error('Error adding option:', error)
        toast.error('Có lỗi xảy ra khi thêm option')
      }
    },
    [createOptionMutation, componentId, form]
  )

  const handleDeleteOption = useCallback(
    async (componentOptionId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await deleteOptionMutation.mutateAsync(componentOptionId)
        toast.success('Xóa option thành công!')
      } catch (error) {
        console.error('Error deleting option:', error)
        toast.error('Có lỗi xảy ra khi xóa option')
      }
    },
    [deleteOptionMutation]
  )

  const handleToggleAddForm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowAddForm((prev) => {
        if (!prev) {
          // Reset mutations when opening form
          createOptionMutation.reset()
        }
        return !prev
      })
    },
    [createOptionMutation]
  )

  if (!componentId) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <Package className='h-16 w-16 text-muted-foreground' />
          <p className='text-muted-foreground'>Chọn một component để xem options</p>
        </div>
      </div>
    )
  }

  const options = optionsData?.data.options || []

  return (
    <div className='bg-gradient-to-br from-primary/5 to-accent/5 border-t border-border'>
      <div className='p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2 bg-background shadow-sm border border-border rounded-xl p-1'>
            <TabsTrigger
              value='options'
              className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all'
            >
              <Settings className='h-4 w-4' aria-hidden='true' />
              Options ({options.length})
            </TabsTrigger>
            <TabsTrigger
              value='info'
              className='flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all'
            >
              <Info className='h-4 w-4' aria-hidden='true' />
              Thông tin
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Options */}
          <TabsContent value='options' className='space-y-4'>
            <Card className='border-0 shadow-md bg-background py-0'>
              <CardHeader className='bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg py-3'>
                <CardTitle className='flex items-center justify-between text-lg'>
                  <div className='flex items-center gap-2'>
                    <Package className='h-5 w-5' aria-hidden='true' />
                    Danh Sách Options ({options.length})
                  </div>
                  <Button
                    size='sm'
                    onClick={handleToggleAddForm}
                    disabled={createOptionMutation.isPending}
                    className='bg-background text-primary hover:bg-accent border border-border'
                    data-action-button='true'
                  >
                    {showAddForm ? (
                      <>
                        <X className='h-4 w-4 mr-2' aria-hidden='true' />
                        Đóng Form
                      </>
                    ) : (
                      <>
                        <Plus className='h-4 w-4 mr-2' aria-hidden='true' />
                        Thêm Option
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                {showAddForm && (
                  <Card className='mb-4 border-2 border-dashed border-primary/30 bg-primary/5'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-base text-primary flex items-center gap-2'>
                        <Plus className='h-4 w-4' aria-hidden='true' />
                        Thêm Option Mới
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddOption)} className='space-y-4'>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField
                              control={form.control}
                              name='name'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-foreground'>Tên Option *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VD: Size S, Color Red'
                                      className='border-border focus:border-primary focus:ring-primary'
                                      disabled={createOptionMutation.isPending}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='price'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-foreground'>Giá (VND) *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      placeholder='VD: 25000'
                                      className='border-border focus:border-primary focus:ring-primary'
                                      disabled={createOptionMutation.isPending}
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-foreground'>Mô tả</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder='Mô tả về option...'
                                    rows={3}
                                    className='border-border focus:border-primary focus:ring-primary'
                                    disabled={createOptionMutation.isPending}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <FormField
                              control={form.control}
                              name='tag.parentTag'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-foreground'>Parent Tags</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VD: Premium, Basic (phân cách bằng dấu phẩy)'
                                      className='border-border focus:border-primary focus:ring-primary'
                                      disabled={createOptionMutation.isPending}
                                      value={field.value?.join(', ') || ''}
                                      onChange={(e) => {
                                        const tags = e.target.value
                                          .split(',')
                                          .map((tag) => tag.trim())
                                          .filter(Boolean)
                                        field.onChange(tags)
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='tag.childTag'
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className='text-foreground'>Child Tags</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder='VD: Size L, Color Red (phân cách bằng dấu phẩy)'
                                      className='border-border focus:border-primary focus:ring-primary'
                                      disabled={createOptionMutation.isPending}
                                      value={field.value?.join(', ') || ''}
                                      onChange={(e) => {
                                        const tags = e.target.value
                                          .split(',')
                                          .map((tag) => tag.trim())
                                          .filter(Boolean)
                                        field.onChange(tags)
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name='images'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-foreground'>Option Images</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='URL hình ảnh option (phân cách bằng dấu phẩy)'
                                    className='border-border focus:border-primary focus:ring-primary'
                                    disabled={createOptionMutation.isPending}
                                    value={field.value?.join(', ') || ''}
                                    onChange={(e) => {
                                      const urls = e.target.value
                                        .split(',')
                                        .map((url) => url.trim())
                                        .filter(Boolean)
                                      field.onChange(urls)
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className='flex gap-2'>
                            <Button
                              type='submit'
                              disabled={createOptionMutation.isPending}
                              className='bg-primary hover:bg-primary/90 text-primary-foreground'
                            >
                              {createOptionMutation.isPending ? (
                                <>
                                  <Loader2 className='animate-spin h-4 w-4 mr-2' aria-hidden='true' />
                                  Đang tạo...
                                </>
                              ) : (
                                <>
                                  <Plus className='h-4 w-4 mr-2' aria-hidden='true' />
                                  Tạo Option
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
                              disabled={createOptionMutation.isPending}
                              className='border-border hover:bg-muted'
                            >
                              Hủy
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}

                {optionsError ? (
                  <div className='mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm'>
                    {optionsError instanceof Error
                      ? optionsError.message
                      : typeof optionsError === 'string'
                        ? optionsError
                        : 'Có lỗi xảy ra khi tải options'}
                  </div>
                ) : null}

                {optionsLoading ? (
                  <div className='text-center py-8'>
                    <div className='flex flex-col items-center gap-2'>
                      <Loader2 className='animate-spin h-6 w-6 text-primary' aria-hidden='true' />
                      <p className='text-muted-foreground text-sm'>Đang tải options...</p>
                    </div>
                  </div>
                ) : options.length === 0 ? (
                  <div className='text-center py-8'>
                    <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' aria-hidden='true' />
                    <h4 className='text-base font-medium text-foreground mb-1'>Chưa có option nào</h4>
                    <p className='text-muted-foreground text-sm'>Component này chưa có option nào được tạo</p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {options.map((option: ComponentOptionType) => (
                      <Card
                        key={`option-${option.id}`}
                        className='relative group hover:shadow-md transition-shadow border border-border'
                      >
                        <CardContent className='p-3'>
                          <div className='flex items-start justify-between mb-2'>
                            <h4 className='font-semibold text-foreground text-sm'>{option.name}</h4>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={(e) => handleDeleteOption(option.id, e)}
                              disabled={deleteOptionMutation.isPending}
                              className='h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
                              aria-label={`Xóa option ${option.name}`}
                              data-action-button='true'
                            >
                              <Trash2 className='h-3 w-3' aria-hidden='true' />
                            </Button>
                          </div>

                          <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground'>ID:</span>
                              <Badge variant='outline' className='text-xs font-mono'>
                                {option.id.slice(-6)}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground'>Status:</span>
                              <Badge
                                variant={option.componentOptionType === 'APPROVED' ? 'default' : 'secondary'}
                                className='text-xs'
                              >
                                {option.componentOptionType}
                              </Badge>
                            </div>
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground'>Price:</span>
                              <Badge variant='outline' className='text-xs'>
                                {option.price.toLocaleString()} VND
                              </Badge>
                            </div>
                            {option.tag && (option.tag.parentTag?.length > 0 || option.tag.childTag?.length > 0) && (
                              <div className='space-y-1'>
                                {option.tag.parentTag && option.tag.parentTag.length > 0 && (
                                  <div>
                                    <span className='text-xs text-muted-foreground'>Parent Tags:</span>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                      {option.tag.parentTag.map((tag, index) => (
                                        <Badge key={index} variant='outline' className='text-xs'>
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {option.tag.childTag && option.tag.childTag.length > 0 && (
                                  <div>
                                    <span className='text-xs text-muted-foreground'>Child Tags:</span>
                                    <div className='flex flex-wrap gap-1 mt-1'>
                                      {option.tag.childTag.map((tag, index) => (
                                        <Badge key={index} variant='secondary' className='text-xs'>
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {option.description && (
                            <div className='pt-2 mt-2 border-t border-border'>
                              <p className='text-xs text-muted-foreground line-clamp-2'>{option.description}</p>
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
            <Card className='border-0 shadow-lg bg-background py-0'>
              <CardHeader className='bg-gradient-to-r from-accent to-accent/90 text-accent-foreground rounded-t-lg py-3'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Info className='h-5 w-5' aria-hidden='true' />
                  Thông Tin Component
                </CardTitle>
              </CardHeader>
              <CardContent className='p-4'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='p-3 bg-primary/10 rounded-lg'>
                    <span className='text-xs font-medium text-primary uppercase tracking-wide'>Tổng options</span>
                    <p className='text-lg font-bold text-primary mt-1'>{options.length}</p>
                  </div>
                  <div className='p-3 bg-accent/10 rounded-lg'>
                    <span className='text-xs font-medium text-accent uppercase tracking-wide'>Options được duyệt</span>
                    <p className='text-lg font-bold text-accent mt-1'>
                      {options.filter((o: ComponentOptionType) => o.componentOptionType === 'APPROVED').length}
                    </p>
                  </div>
                  <div className='p-3 bg-secondary/10 rounded-lg'>
                    <span className='text-xs font-medium text-secondary-foreground uppercase tracking-wide'>
                      Có hình ảnh
                    </span>
                    <p className='text-lg font-bold text-secondary-foreground mt-1'>
                      {options.filter((o: ComponentOptionType) => o.images && o.images.length > 0).length}
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
}
