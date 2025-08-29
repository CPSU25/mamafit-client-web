import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, Palette, Sparkles, Loader2, CheckCircle2, AlertCircle, DollarSign } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SingleImageUpload } from '@/components/ui/single-image-upload'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCreateTemplate, useTemplates } from '@/services/designer/template.service'
import { useComponents, useComponent } from '@/services/admin/manage-component.service'
import { useGetStyles } from '@/services/admin/category.service'
import { PresetFormData } from '@/@types/manage-template.types'
import { ComponentOptionType } from '@/@types/manage-component.types'
import { StyleType } from '@/@types/manage-maternity-dress.types'
import { toast } from 'sonner'
import { PriceInput } from '@/components/ui/price-input'

interface CreatePresetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

// Zod schema for form validation
const formSchema = z.object({
  styleId: z.string().min(1, 'Vui lòng chọn kiểu style'),
  name: z.string().min(1, 'Vui lòng nhập tên preset'),
  images: z.array(z.string()).min(1, 'Vui lòng tải lên ít nhất 1 hình ảnh'),
  price: z.number().min(1, 'Giá phải lớn hơn 0'),
  isDefault: z.boolean(),
  hemOptionId: z.string().min(1, 'Vui lòng chọn kiểu viền'),
  necklineOptionId: z.string().min(1, 'Vui lòng chọn kiểu cổ áo'),
  waistOptionId: z.string().min(1, 'Vui lòng chọn kiểu eo'),
  sleevesOptionId: z.string().min(1, 'Vui lòng chọn kiểu tay áo'),
  fabricOptionId: z.string().min(1, 'Vui lòng chọn chất liệu'),
  colorOptionId: z.string().min(1, 'Vui lòng chọn màu sắc')
})

type FormDataType = z.infer<typeof formSchema>

// Component colors mapping
const componentColors = {
  Hem: 'bg-blue-500',
  Neckline: 'bg-green-500',
  Waist: 'bg-purple-500',
  Sleeves: 'bg-orange-500',
  Fabric: 'bg-pink-500',
  Color: 'bg-indigo-500'
}

const componentLabels = {
  Hem: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  Neckline: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  Waist: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  Sleeves: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  Fabric: { color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  Color: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' }
}

export default function CreatePresetModal({ open, onOpenChange, onSuccess }: CreatePresetModalProps) {
  const form = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      styleId: '',
      name: '',
      images: [],
      price: 0,
      isDefault: false,
      hemOptionId: '',
      necklineOptionId: '',
      waistOptionId: '',
      sleevesOptionId: '',
      fabricOptionId: '',
      colorOptionId: ''
    }
  })

  const formData = form.watch() // Watch all form values for UI logic
  const errors = form.formState.errors // Get form errors

  const createTemplateMutation = useCreateTemplate()

  // Load presets to enforce "only one default per style"
  const { data: templatesData } = useTemplates({ index: 0, pageSize: 1000 })
  const hasDefaultForSelectedStyle = (() => {
    if (!formData.styleId) return false
    const items = templatesData?.items || []
    return items.some((t: { styleId: string; isDefault: boolean }) => t.styleId === formData.styleId && t.isDefault)
  })()

  // Fetch styles data với filter isCustom = true
  const { data: stylesData } = useGetStyles({
    pageSize: 100
  })

  // Filter chỉ lấy những style có isCustom = true
  const customStyles: StyleType[] = stylesData?.data?.items?.filter((style: StyleType) => style.isCustom === true) || []

  // Fetch components data to get IDs first
  const { data: componentsData, isLoading: isLoadingComponents } = useComponents({
    pageSize: 100
  })

  // Get component IDs by name
  const getComponentIdByName = (name: string): string | undefined => {
    return componentsData?.data?.items.find((comp) => comp.name.toLowerCase() === name.toLowerCase())?.id
  }

  // Fetch component details with options
  const hemComponentId = getComponentIdByName('Hem')
  const necklineComponentId = getComponentIdByName('Neckline')
  const waistComponentId = getComponentIdByName('Waist')
  const sleevesComponentId = getComponentIdByName('Sleeves')
  const fabricComponentId = getComponentIdByName('Fabric')
  const colorComponentId = getComponentIdByName('Color')

  const { data: hemComponent } = useComponent(hemComponentId || '')
  const { data: necklineComponent } = useComponent(necklineComponentId || '')
  const { data: waistComponent } = useComponent(waistComponentId || '')
  const { data: sleevesComponent } = useComponent(sleevesComponentId || '')
  const { data: fabricComponent } = useComponent(fabricComponentId || '')
  const { data: colorComponent } = useComponent(colorComponentId || '')

  // Extract options from component details
  const hemOptions = hemComponent?.data?.options || []
  const necklineOptions = necklineComponent?.data?.options || []
  const waistOptions = waistComponent?.data?.options || []
  const sleevesOptions = sleevesComponent?.data?.options || []
  const fabricOptions = fabricComponent?.data?.options || []
  const colorOptions = colorComponent?.data?.options || []

  // Handle form submission
  const handleSubmit = async (data: FormDataType) => {
    if (data.isDefault && hasDefaultForSelectedStyle) {
      toast.error('Style này đã có preset mặc định. Hãy bỏ chọn hoặc chọn style khác.')
      return
    }
    // Collect all selected component option IDs
    const componentOptionIds = [
      data.hemOptionId,
      data.necklineOptionId,
      data.waistOptionId,
      data.sleevesOptionId,
      data.fabricOptionId,
      data.colorOptionId
    ].filter(Boolean) // Remove empty strings

    console.log('Selected component option IDs:', componentOptionIds)

    const presetFormData: PresetFormData = {
      sku: '',
      name: data.name,
      styleId: data.styleId,
      images: data.images,
      type: 'SYSTEM',
      isDefault: data.isDefault,
      price: data.price,
      componentOptionIds
    }

    try {
      await createTemplateMutation.mutateAsync(presetFormData)
      toast.success('Tạo preset thành công!')

      // Reset form
      form.reset()
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Create preset failed:', error)
      toast.error('Có lỗi xảy ra khi tạo preset')
    }
  }

  const handleImageChange = (value: string) => {
    form.setValue('images', [value])
  }

  const handleInputChange = (field: keyof FormDataType, value: string | number | boolean) => {
    // Type-safe setValue with specific handling for each field type
    if (field === 'price') {
      form.setValue(field, value as number)
    } else if (field === 'isDefault') {
      form.setValue(field, value as boolean)
    } else {
      form.setValue(field, value as string)
    }
  }

  const handleComponentChange = (
    component:
      | 'hemOptionId'
      | 'necklineOptionId'
      | 'waistOptionId'
      | 'sleevesOptionId'
      | 'fabricOptionId'
      | 'colorOptionId',
    value: string
  ) => {
    handleInputChange(component, value)
  }

  const isFormValid =
    formData.styleId &&
    formData.images.length > 0 &&
    formData.price > 0 &&
    formData.hemOptionId &&
    formData.necklineOptionId &&
    formData.waistOptionId &&
    formData.sleevesOptionId &&
    formData.fabricOptionId &&
    formData.colorOptionId

  const isLoading = createTemplateMutation.isPending || isLoadingComponents

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[95vh] overflow-y-auto'>
        <DialogHeader className='text-center pb-4'>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-3'>
            <Sparkles className='h-8 w-8 text-purple-500' />
            Tạo mẫu đầm bầu mới
          </DialogTitle>
          <DialogDescription className='text-base text-center text-gray-600 mt-3'>
            Thiết kế một preset váy bầu tuyệt đẹp bằng cách chọn các thành phần và tải lên hình ảnh
          </DialogDescription>
        </DialogHeader>

        {/* Style Selection and Default Preset */}
        <div className='flex flex-row gap-6 mb-6'>
          {/* Style Selection */}
          <div className='flex-1 space-y-3'>
            <Label className=' text-base font-medium text-gray-700 flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-purple-600' />
              Chọn Kiểu Dáng *
            </Label>
            <Select value={formData.styleId} onValueChange={(value) => handleInputChange('styleId', value)}>
              <SelectTrigger className={`!h-20 text-base ${errors.styleId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn kiểu dáng cho mẫu đầm bầu...' className='!h-20' />
              </SelectTrigger>
              <SelectContent>
                {customStyles.map((style: StyleType) => (
                  <SelectItem key={style.id} value={style.id}>
                    <div className='flex flex-col items-start gap-1'>
                      <span className='font-medium text-sm'>{style.name}</span>
                      {style.description && (
                        <span className='text-xs text-muted-foreground line-clamp-1'>{style.description}</span>
                      )}
                      <Badge variant='outline' className='text-xs'>
                        Kiểu dáng custom
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.styleId && (
              <p className='text-sm text-red-500 flex items-center gap-1'>
                <AlertCircle className='h-4 w-4' />
                {errors.styleId.message}
              </p>
            )}
          </div>

          <div className='flex items-center justify-center pt-8'>
            <div className='flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <Checkbox
                id='isDefault'
                checked={formData.isDefault}
                disabled={!formData.styleId || hasDefaultForSelectedStyle}
                onCheckedChange={(checked) => {
                  if (hasDefaultForSelectedStyle && checked) {
                    toast.warning('Style này đã có preset mặc định')
                    return
                  }
                  handleInputChange('isDefault', Boolean(checked))
                }}
              />
              <Label htmlFor='isDefault' className='text-sm text-blue-700 font-medium cursor-pointer'>
                Đặt làm preset mặc định
              </Label>
            </div>
          </div>
        </div>

        <div className='flex flex-row gap-4 mb-6'>
          <div className='flex-1'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-base font-medium text-gray-700 flex items-center gap-2'>
                <Sparkles className='h-4 w-4 text-purple-600' />
                Tên mẫu
              </Label>
              <Input
                id='name'
                type='text'
                placeholder='Tên của mẫu đầm bầu'
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`h-12 text-base ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.name && (
                <p className='text-sm text-red-500 flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div className='flex-1'>
            <div className='space-y-2'>
              <Label htmlFor='price' className='text-base font-medium text-gray-700 flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-green-600' />
                Giá (VNĐ)
              </Label>
              <PriceInput
                id='price'
                value={formData.price}
                onChange={(val) => handleInputChange('price', val)}
                minValue={0}
                placeholder='0'
                className={`h-12 text-base ${errors.price ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.price && (
                <p className='text-sm text-red-500 flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator className='my-6' />

        <div className='grid grid-cols-12 gap-8'>
          <div className='col-span-4 space-y-6'>
            <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Palette className='h-5 w-5' />
              Thành Phần Dress
            </h3>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`w-3 h-3 rounded-full ${componentColors.Hem}`}></div>
                <Label className={`font-medium ${componentLabels.Hem.color}`}>Hem (Viền)</Label>
              </div>
              <div className={`p-4 rounded-lg border ${componentLabels.Hem.bg} ${componentLabels.Hem.border}`}>
                <Select
                  value={formData.hemOptionId}
                  onValueChange={(value) => handleComponentChange('hemOptionId', value)}
                >
                  <SelectTrigger className={`bg-white h-10 ${errors.hemOptionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Chọn kiểu viền' />
                  </SelectTrigger>
                  <SelectContent>
                    {hemOptions.map((option: ComponentOptionType) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hemOptionId && (
                  <p className='text-sm text-red-500 mt-1 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.hemOptionId.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`w-3 h-3 rounded-full ${componentColors.Neckline}`}></div>
                <Label className={`font-medium ${componentLabels.Neckline.color}`}>Neckline (Cổ áo)</Label>
              </div>
              <div
                className={`p-4 rounded-lg border ${componentLabels.Neckline.bg} ${componentLabels.Neckline.border}`}
              >
                <Select
                  value={formData.necklineOptionId}
                  onValueChange={(value) => handleComponentChange('necklineOptionId', value)}
                >
                  <SelectTrigger className={`bg-white h-10 ${errors.necklineOptionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Chọn kiểu cổ áo' />
                  </SelectTrigger>
                  <SelectContent>
                    {necklineOptions.map((option: ComponentOptionType) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.necklineOptionId && (
                  <p className='text-sm text-red-500 mt-1 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.necklineOptionId.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`w-3 h-3 rounded-full ${componentColors.Waist}`}></div>
                <Label className={`font-medium ${componentLabels.Waist.color}`}>Waist (Eo)</Label>
              </div>
              <div className={`p-4 rounded-lg border ${componentLabels.Waist.bg} ${componentLabels.Waist.border}`}>
                <Select
                  value={formData.waistOptionId}
                  onValueChange={(value) => handleComponentChange('waistOptionId', value)}
                >
                  <SelectTrigger className={`bg-white h-10 ${errors.waistOptionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Chọn kiểu eo' />
                  </SelectTrigger>
                  <SelectContent>
                    {waistOptions.map((option: ComponentOptionType) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.waistOptionId && (
                  <p className='text-sm text-red-500 mt-1 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.waistOptionId.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`w-3 h-3 rounded-full ${componentColors.Sleeves}`}></div>
                <Label className={`font-medium ${componentLabels.Sleeves.color}`}>Sleeves (Tay áo)</Label>
              </div>
              <div className={`p-4 rounded-lg border ${componentLabels.Sleeves.bg} ${componentLabels.Sleeves.border}`}>
                <Select
                  value={formData.sleevesOptionId}
                  onValueChange={(value) => handleComponentChange('sleevesOptionId', value)}
                >
                  <SelectTrigger className={`bg-white h-10 ${errors.sleevesOptionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Chọn kiểu tay áo' />
                  </SelectTrigger>
                  <SelectContent>
                    {sleevesOptions.map((option: ComponentOptionType) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sleevesOptionId && (
                  <p className='text-sm text-red-500 mt-1 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.sleevesOptionId.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='col-span-4 flex flex-col items-center space-y-6'>
            <div className='relative'>
              <div className='relative w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-4 border-dashed border-gray-300 shadow-xl overflow-hidden'>
                {formData.images.length > 0 ? (
                  <img src={formData.images[0]} alt='Preset preview' className='w-full h-full object-cover' />
                ) : (
                  <div className='absolute inset-0 flex flex-col items-center justify-center text-center space-y-6'>
                    <div className='w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center'>
                      <Upload className='h-10 w-10 text-purple-500' />
                    </div>
                    <div className='space-y-2'>
                      <p className='text-xl font-semibold text-gray-600'>Xem Trước Thiết Kế</p>
                      <p className='text-sm text-gray-500'>Tải lên hình ảnh để xem thiết kế của bạn</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.images && (
                <p className='text-sm text-red-500 mt-2 text-center flex items-center justify-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.images.message}
                </p>
              )}
            </div>

            <div className='w-full p-6 bg-white rounded-xl shadow-lg border border-gray-200'>
              <div className='flex items-center gap-3 mb-4'>
                <Palette className='h-5 w-5 text-purple-500' />
                <h3 className='text-lg font-semibold text-gray-800'>Tải Lên Hình Ảnh</h3>
              </div>
              <SingleImageUpload
                value={formData.images[0] || ''}
                onChange={handleImageChange}
                placeholder='Tải lên thiết kế váy của bạn'
                className='w-full'
              />
            </div>
          </div>

          <div className='col-span-4 space-y-6'>
            <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
              <Palette className='h-5 w-5' />
              Chất Liệu & Màu Sắc
            </h3>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`w-3 h-3 rounded-full ${componentColors.Fabric}`}></div>
                <Label className={`font-medium ${componentLabels.Fabric.color}`}>Fabric (Chất liệu)</Label>
              </div>
              <div className={`p-4 rounded-lg border ${componentLabels.Fabric.bg} ${componentLabels.Fabric.border}`}>
                <Select
                  value={formData.fabricOptionId}
                  onValueChange={(value) => handleComponentChange('fabricOptionId', value)}
                >
                  <SelectTrigger className={`bg-white h-10 ${errors.fabricOptionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Chọn chất liệu' />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricOptions.map((option: ComponentOptionType) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.fabricOptionId && (
                  <p className='text-sm text-red-500 mt-1 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.fabricOptionId.message}
                  </p>
                )}
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className={`w-3 h-3 rounded-full ${componentColors.Color}`}></div>
                <Label className={`font-medium ${componentLabels.Color.color}`}>Color (Màu sắc)</Label>
              </div>
              <div className={`p-4 rounded-lg border ${componentLabels.Color.bg} ${componentLabels.Color.border}`}>
                <Select
                  value={formData.colorOptionId}
                  onValueChange={(value) => handleComponentChange('colorOptionId', value)}
                >
                  <SelectTrigger className={`bg-white h-10 ${errors.colorOptionId ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder='Chọn màu sắc' />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option: ComponentOptionType) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.colorOptionId && (
                  <p className='text-sm text-red-500 mt-1 flex items-center gap-1'>
                    <AlertCircle className='h-3 w-3' />
                    {errors.colorOptionId.message}
                  </p>
                )}
              </div>
            </div>

            <div className='p-4 bg-gray-50 rounded-lg border'>
              <h4 className='font-medium text-gray-700 mb-3'>Tóm tắt lựa chọn:</h4>
              <div className='space-y-2 text-sm'>
                {formData.styleId && (
                  <Badge variant='default' className='mr-2 bg-purple-500'>
                    Style: {customStyles.find((s: StyleType) => s.id === formData.styleId)?.name}
                  </Badge>
                )}
                {formData.hemOptionId && (
                  <Badge variant='outline' className='mr-2'>
                    Hem: {hemOptions.find((o: ComponentOptionType) => o.id === formData.hemOptionId)?.name}
                  </Badge>
                )}
                {formData.necklineOptionId && (
                  <Badge variant='outline' className='mr-2'>
                    Cổ: {necklineOptions.find((o: ComponentOptionType) => o.id === formData.necklineOptionId)?.name}
                  </Badge>
                )}
                {formData.waistOptionId && (
                  <Badge variant='outline' className='mr-2'>
                    Eo: {waistOptions.find((o: ComponentOptionType) => o.id === formData.waistOptionId)?.name}
                  </Badge>
                )}
                {formData.sleevesOptionId && (
                  <Badge variant='outline' className='mr-2'>
                    Tay: {sleevesOptions.find((o: ComponentOptionType) => o.id === formData.sleevesOptionId)?.name}
                  </Badge>
                )}
                {formData.fabricOptionId && (
                  <Badge variant='outline' className='mr-2'>
                    Vải: {fabricOptions.find((o: ComponentOptionType) => o.id === formData.fabricOptionId)?.name}
                  </Badge>
                )}
                {formData.colorOptionId && (
                  <Badge variant='outline' className='mr-2'>
                    Màu: {colorOptions.find((o: ComponentOptionType) => o.id === formData.colorOptionId)?.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='bg-gray-50/50 -mx-6 -mb-6 px-8 py-6 rounded-b-lg mt-8'>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center gap-3'>
              {isFormValid ? (
                <>
                  <CheckCircle2 className='w-5 h-5 text-green-500' />
                  <span className='text-base text-green-600 font-medium'>Sẵn sàng để lưu</span>
                </>
              ) : (
                <>
                  <AlertCircle className='w-5 h-5 text-gray-400' />
                  <span className='text-base text-gray-500'>Vui lòng hoàn thành tất cả trường</span>
                </>
              )}
            </div>
            <div className='flex gap-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='px-8 py-3 text-base hover:bg-gray-100'
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type='button'
                onClick={form.handleSubmit(handleSubmit)}
                disabled={!isFormValid || isLoading}
                className='px-10 py-3 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-5 w-5 mr-2' />
                    Lưu Preset
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
