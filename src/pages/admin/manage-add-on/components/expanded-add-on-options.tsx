import { useState, useCallback, useEffect } from 'react'
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
  Sparkles,
  ChevronRight,
  Edit2,
  Save,
  DollarSign,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  useCreateAddOnOption,
  useUpdateAddOnOption,
  useDeleteAddOnOption,
  useGetPositions,
  useGetSizes
} from '@/services/admin/add-on.service'
import { toast } from 'sonner'
import { AddOn, AddOnOption, PositionSchema, SizeSchema } from '../data/schema'
import { cn } from '@/lib/utils/utils'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { itemServiceTypeOptions } from '../data/data'
import { ItemServiceType } from '@/@types/add-on.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const addOnOptionFormSchema = z.object({
  addOnId: z.string(),
  name: z.string().min(1, { message: 'Tên option là bắt buộc' }),
  description: z.string().min(1, { message: 'Mô tả là bắt buộc' }),
  price: z.number().min(0, { message: 'Giá phải >= 0' }),
  itemServiceType: z.nativeEnum(ItemServiceType),
  positionId: z.string().min(1, { message: 'Position là bắt buộc' }),
  sizeId: z.string().min(1, { message: 'Size là bắt buộc' })
})

type AddOnOptionFormData = z.infer<typeof addOnOptionFormSchema>

interface ExpandedAddOnOptionsProps {
  addOn: AddOn
}

export const ExpandedAddOnOptions = ({ addOn }: ExpandedAddOnOptionsProps) => {
  const [activeTab, setActiveTab] = useState('options')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [editingOption, setEditingOption] = useState<AddOnOption | null>(null)

  const { data: positionsResponse } = useGetPositions()
  const { data: sizesResponse } = useGetSizes()

  const createOptionMutation = useCreateAddOnOption()
  const updateOptionMutation = useUpdateAddOnOption()
  const deleteOptionMutation = useDeleteAddOnOption()

  const form = useForm<AddOnOptionFormData>({
    resolver: zodResolver(addOnOptionFormSchema),
    defaultValues: {
      addOnId: addOn.id,
      name: '',
      description: '',
      price: 0,
      itemServiceType: ItemServiceType.IMAGE,
      positionId: '',
      sizeId: ''
    }
  })

  useEffect(() => {
    if (editingOption) {
      form.reset({
        addOnId: addOn.id,
        name: editingOption.name,
        description: editingOption.description,
        price: editingOption.price,
        itemServiceType: editingOption.itemServiceType as ItemServiceType,
        positionId: editingOption.position?.id || '',
        sizeId: editingOption.size?.id || ''
      })
    } else {
      form.reset({
        addOnId: addOn.id,
        name: '',
        description: '',
        price: 0,
        itemServiceType: ItemServiceType.IMAGE,
        positionId: '',
        sizeId: ''
      })
    }
    setShowAddForm(false)
  }, [addOn.id, editingOption, form])

  const handleAddOption = useCallback(
    async (data: AddOnOptionFormData) => {
      try {
        if (editingOption) {
          await updateOptionMutation.mutateAsync({
            id: editingOption.id,
            data
          })
          toast.success('Cập nhật option thành công!', {
            description: `Option "${data.name}" đã được cập nhật.`
          })
          setEditingOption(null)
        } else {
          await createOptionMutation.mutateAsync(data)
          toast.success('Thêm option thành công!', {
            description: `Option "${data.name}" đã được tạo.`
          })
        }
        setShowAddForm(false)
        form.reset({
          addOnId: addOn.id,
          name: '',
          description: '',
          price: 0,
          itemServiceType: ItemServiceType.IMAGE,
          positionId: '',
          sizeId: ''
        })
      } catch (error) {
        console.error('Error adding/updating option:', error)
        toast.error('Không thể thêm/cập nhật option', {
          description: 'Vui lòng thử lại sau.'
        })
      }
    },
    [createOptionMutation, updateOptionMutation, editingOption, addOn.id, form]
  )

  const handleDeleteOption = useCallback(
    async (optionId: string, optionName: string, e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await deleteOptionMutation.mutateAsync(optionId)
        toast.success('Xóa option thành công!', {
          description: `Option "${optionName}" đã được xóa.`
        })
        setSelectedOptions((prev) => prev.filter((id) => id !== optionId))
      } catch (error) {
        console.error('Error deleting option:', error)
        toast.error('Không thể xóa option', {
          description: 'Vui lòng thử lại sau.'
        })
      }
    },
    [deleteOptionMutation]
  )

  const handleEditOption = useCallback((option: AddOnOption) => {
    setEditingOption(option)
    setShowAddForm(true)
  }, [])

  const handleToggleAddForm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowAddForm((prev) => {
        if (!prev) {
          createOptionMutation.reset()
          setEditingOption(null)
        }
        return !prev
      })
    },
    [createOptionMutation]
  )

  const handleSelectOption = (optionId: string) => {
    setSelectedOptions((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]))
  }

  if (!addOn) {
    return (
      <div className='p-12 text-center bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <Package className='h-10 w-10 text-blue-500' />
          </div>
          <div>
            <p className='text-lg font-medium text-foreground'>Chọn một add-on</p>
            <p className='text-sm text-muted-foreground'>để xem và quản lý các options</p>
          </div>
        </div>
      </div>
    )
  }

  const options: AddOnOption[] = addOn.addOnOptions || []
  const positions: PositionSchema[] = Array.isArray(positionsResponse?.data?.data?.items)
    ? positionsResponse.data.data.items
    : []
  const sizes: SizeSchema[] = Array.isArray(sizesResponse?.data?.data?.items) ? sizesResponse.data.data.items : []

  const totalValue = options.reduce((sum, option) => sum + option.price, 0)
  const averagePrice = options.length > 0 ? totalValue / options.length : 0

  return (
    <div className='bg-gradient-to-br from-blue-50/50 via-background to-blue-100/30 dark:from-blue-950/20 dark:via-background dark:to-blue-900/20 border-t-2 border-blue-200 dark:border-blue-800'>
      <div className='p-6'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
          <TabsList className='grid w-full max-w-md grid-cols-2 bg-white dark:bg-gray-900 shadow-lg border border-blue-200 dark:border-blue-800 rounded-xl p-1'>
            <TabsTrigger
              value='options'
              className={cn(
                'flex items-center gap-2 rounded-lg transition-all duration-200',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600',
                'data-[state=active]:text-white data-[state=active]:shadow-md'
              )}
            >
              <Palette className='h-4 w-4' />
              <span className='font-semibold'>Options</span>
              <Badge
                variant='secondary'
                className={cn(
                  'ml-1 text-xs',
                  activeTab === 'options'
                    ? 'bg-white/20 text-white'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                )}
              >
                {options.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value='info'
              className={cn(
                'flex items-center gap-2 rounded-lg transition-all duration-200',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600',
                'data-[state=active]:text-white data-[state=active]:shadow-md'
              )}
            >
              <Info className='h-4 w-4' />
              <span className='font-semibold'>Thông tin</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='options' className='space-y-6 mt-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg'>
                  <Palette className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-foreground'>Danh sách Options</h3>
                  <p className='text-sm text-muted-foreground'>Quản lý các options của add-on này</p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {selectedOptions.length > 0 && (
                  <Badge
                    variant='secondary'
                    className='bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                  >
                    {selectedOptions.length} đã chọn
                  </Badge>
                )}
                <Button
                  size='default'
                  onClick={handleToggleAddForm}
                  disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                  className={cn(
                    'relative overflow-hidden',
                    showAddForm
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
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
                      {editingOption ? 'Chỉnh sửa' : 'Thêm Option'}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showAddForm && (
              <Card className='border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 shadow-xl'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300'>
                    <Sparkles className='h-5 w-5' />
                    {editingOption ? 'Chỉnh sửa Option' : 'Tạo Option Mới'}
                  </CardTitle>
                  <CardDescription>
                    {editingOption ? 'Cập nhật thông tin option' : 'Điền thông tin để tạo option mới cho add-on này'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddOption)} className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground font-semibold'>
                                Tên Option <span className='text-red-500'>*</span>
                              </FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <Tag className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500' />
                                  <Input
                                    placeholder='VD: Logo in, Text out, Pattern...'
                                    className='pl-10 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600'
                                    disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                                    {...field}
                                  />
                                </div>
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
                              <FormLabel className='text-foreground font-semibold'>
                                Giá <span className='text-red-500'>*</span>
                              </FormLabel>
                              <FormControl>
                                <div className='relative'>
                                  <DollarSign className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500' />
                                  <Input
                                    type='number'
                                    placeholder='0'
                                    className='pl-10 border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600'
                                    disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                          control={form.control}
                          name='itemServiceType'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground font-semibold'>
                                Loại dịch vụ <span className='text-red-500'>*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className='border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600'>
                                    <SelectValue placeholder='Chọn loại dịch vụ' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {itemServiceTypeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='positionId'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground font-semibold'>
                                Position <span className='text-red-500'>*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className='border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600'>
                                    <SelectValue placeholder='Chọn position' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {positions.map((position) => (
                                    <SelectItem key={position.id} value={position.id}>
                                      {position.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name='sizeId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground font-semibold'>
                              Size <span className='text-red-500'>*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className='border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600'>
                                  <SelectValue placeholder='Chọn size' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sizes.map((size) => (
                                  <SelectItem key={size.id} value={size.id}>
                                    {size.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground font-semibold'>Mô tả</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Mô tả chi tiết về option này...'
                                rows={3}
                                className='border-blue-200 dark:border-blue-800 focus:border-blue-400 dark:focus:border-blue-600 resize-none'
                                disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
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
                          disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                          className='bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md'
                        >
                          {createOptionMutation.isPending || updateOptionMutation.isPending ? (
                            <>
                              <Loader2 className='animate-spin h-4 w-4 mr-2' />
                              {editingOption ? 'Đang cập nhật...' : 'Đang tạo...'}
                            </>
                          ) : (
                            <>
                              <Save className='h-4 w-4 mr-2' />
                              {editingOption ? 'Cập nhật Option' : 'Lưu Option'}
                            </>
                          )}
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => {
                            setShowAddForm(false)
                            setEditingOption(null)
                            form.reset()
                          }}
                          disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                          className='border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {options.length === 0 ? (
              <Card className='border-2 border-dashed border-blue-200 dark:border-blue-800'>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <div className='h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4'>
                    <Package className='h-10 w-10 text-blue-500' />
                  </div>
                  <h4 className='text-lg font-semibold text-foreground mb-2'>Chưa có option nào</h4>
                  <p className='text-sm text-muted-foreground text-center max-w-sm'>
                    Add-on này chưa có option nào. Hãy thêm option đầu tiên để bắt đầu.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {options.map((option) => (
                  <Card
                    key={`option-${option.id}`}
                    className={cn(
                      'relative group hover:shadow-xl transition-all duration-300 cursor-pointer',
                      'border-2',
                      selectedOptions.includes(option.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                    )}
                    onClick={() => handleSelectOption(option.id)}
                  >
                    <CardContent className='p-4'>
                      {/* Option Header */}
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex items-center gap-2 flex-1'>
                          <Avatar className='h-10 w-10 border-2 border-blue-200 dark:border-blue-800'>
                            <AvatarFallback className='bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-bold'>
                              {option.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-semibold text-foreground truncate'>{option.name}</h4>
                            <div className='flex items-center gap-1 mt-0.5'>
                              <Hash className='h-3 w-3 text-muted-foreground' />
                              <span className='text-xs text-muted-foreground font-mono'>{option.id.slice(-6)}</span>
                            </div>
                          </div>
                        </div>

                        <div className='flex gap-1'>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => handleEditOption(option)}
                                  disabled={deleteOptionMutation.isPending}
                                  className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-blue-950/30'
                                  data-action-button='true'
                                >
                                  <Edit2 className='h-4 w-4 text-blue-500' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Chỉnh sửa option</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={(e) => handleDeleteOption(option.id, option.name, e)}
                                  disabled={deleteOptionMutation.isPending}
                                  className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-950/30'
                                  data-action-button='true'
                                >
                                  <Trash2 className='h-4 w-4 text-red-500' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Xóa option</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <Badge
                            variant='secondary'
                            className='bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs'
                          >
                            {itemServiceTypeOptions.find((t) => t.value === option.itemServiceType)?.label}
                          </Badge>
                          <span className='text-sm font-semibold text-green-600'>
                            {option.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>

                        {option.position && (
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Tag className='h-3 w-3' />
                            <span>Position: {option.position.name}</span>
                          </div>
                        )}

                        {option.size && (
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <Tag className='h-3 w-3' />
                            <span>Size: {option.size.name}</span>
                          </div>
                        )}

                        {option.description && (
                          <p className='text-xs text-muted-foreground line-clamp-2 pt-2 border-t'>
                            {option.description}
                          </p>
                        )}
                      </div>

                      {selectedOptions.includes(option.id) && (
                        <div className='absolute top-2 right-2'>
                          <div className='h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center'>
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
              <CardHeader className='bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg py-4'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Info className='h-5 w-5' />
                  Thông Tin Chi Tiết Add-on
                </CardTitle>
                <CardDescription className='text-blue-100'>
                  Thống kê và phân tích về các options trong add-on này
                </CardDescription>
              </CardHeader>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                  <div className='relative p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-200 dark:border-blue-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide'>
                          Tổng Options
                        </span>
                        <p className='text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1'>{options.length}</p>
                      </div>
                      <div className='h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center'>
                        <Palette className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <div className='mt-3'>
                      <Progress value={(options.length / 20) * 100} className='h-2' />
                      <p className='text-xs text-muted-foreground mt-1'>Tối đa 20 options</p>
                    </div>
                  </div>

                  <div className='relative p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl border border-green-200 dark:border-green-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide'>
                          Tổng Giá Trị
                        </span>
                        <p className='text-2xl font-bold text-green-700 dark:text-green-300 mt-1'>
                          {totalValue.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <div className='h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center'>
                        <DollarSign className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <div className='mt-3'>
                      <Progress value={Math.min((totalValue / 1000000) * 100, 100)} className='h-2' />
                      <p className='text-xs text-muted-foreground mt-1'>Mục tiêu 1M VND</p>
                    </div>
                  </div>

                  <div className='relative p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-200 dark:border-purple-800'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide'>
                          Giá Trung Bình
                        </span>
                        <p className='text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1'>
                          {averagePrice.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <div className='h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center'>
                        <Sparkles className='h-6 w-6 text-white' />
                      </div>
                    </div>
                    <div className='mt-3'>
                      <Progress value={Math.min((averagePrice / 100000) * 100, 100)} className='h-2' />
                      <p className='text-xs text-muted-foreground mt-1'>Mục tiêu 100K VND</p>
                    </div>
                  </div>
                </div>

                <div className='border-t pt-6'>
                  <h4 className='text-sm font-semibold text-foreground mb-3'>Thao Tác Nhanh</h4>
                  <div className='flex flex-wrap gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setActiveTab('options')}
                      className='border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30'
                    >
                      <Edit2 className='h-4 w-4 mr-2' />
                      Quản lý Options
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setShowAddForm(true)}
                      disabled={createOptionMutation.isPending || updateOptionMutation.isPending}
                      className='border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950/30'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Thêm Option Mới
                    </Button>
                  </div>
                </div>

                {options.length > 0 && (
                  <div className='border-t pt-6 mt-6'>
                    <h4 className='text-sm font-semibold text-foreground mb-3'>Options Gần Đây</h4>
                    <div className='space-y-2'>
                      {options.slice(0, 3).map((option) => (
                        <div key={option.id} className='flex items-center gap-3 p-2 rounded-lg bg-muted/50'>
                          <Avatar className='h-8 w-8'>
                            <AvatarFallback className='bg-blue-500 text-white text-xs'>
                              {option.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <p className='text-sm font-medium text-foreground'>{option.name}</p>
                            <p className='text-xs text-muted-foreground'>
                              {option.price.toLocaleString('vi-VN')}đ •{' '}
                              {itemServiceTypeOptions.find((t) => t.value === option.itemServiceType)?.label}
                            </p>
                          </div>
                          <Badge variant='secondary' className='text-xs'>
                            {option.position?.name}
                          </Badge>
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
