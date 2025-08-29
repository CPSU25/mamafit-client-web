import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Palette, DollarSign } from 'lucide-react'
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
import { SingleImageUpload } from '@/components/ui/single-image-upload'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUpdateTemplate, useTemplateDetail } from '@/services/designer/template.service'
import { useComponents, useComponent } from '@/services/admin/manage-component.service'
import { useGetStyles } from '@/services/admin/category.service'
import { PresetFormData } from '@/@types/manage-template.types'
import { StyleType } from '@/@types/manage-maternity-dress.types'
import { ComponentOptionType } from '@/@types/manage-component.types'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { PriceInput } from '@/components/ui/price-input'

interface EditPresetModalProps {
  open: boolean
  presetId: string | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

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

export default function EditPresetModal({ open, presetId, onOpenChange, onSuccess }: EditPresetModalProps) {
  const updateMutation = useUpdateTemplate()
  const { data: presetDetail } = useTemplateDetail(presetId || '')

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

  const formData = form.watch()
  const errors = form.formState.errors

  // Load styles and components
  const { data: stylesData } = useGetStyles({ pageSize: 100 })
  const customStyles: StyleType[] = stylesData?.data?.items?.filter((s: StyleType) => s.isCustom === true) || []

  // Load component IDs then fetch options per component
  const { data: componentsData } = useComponents({ pageSize: 100 })
  const getComponentIdByName = (name: string): string | undefined =>
    componentsData?.data?.items.find((comp) => comp.name.toLowerCase() === name.toLowerCase())?.id

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

  const hemOptions = hemComponent?.data?.options || []
  const necklineOptions = necklineComponent?.data?.options || []
  const waistOptions = waistComponent?.data?.options || []
  const sleevesOptions = sleevesComponent?.data?.options || []
  const fabricOptions = fabricComponent?.data?.options || []
  const colorOptions = colorComponent?.data?.options || []

  useEffect(() => {
    if (!presetDetail) return
    const t = presetDetail
    form.reset({
      styleId: t.styleId,
      name: t.name || '',
      images: t.images || [],
      price: t.price || 0,
      isDefault: t.isDefault,
      hemOptionId: t.componentOptions?.find((o) => o.componentName === 'Hem')?.id || '',
      necklineOptionId: t.componentOptions?.find((o) => o.componentName === 'Neckline')?.id || '',
      waistOptionId: t.componentOptions?.find((o) => o.componentName === 'Waist')?.id || '',
      sleevesOptionId: t.componentOptions?.find((o) => o.componentName === 'Sleeves')?.id || '',
      fabricOptionId: t.componentOptions?.find((o) => o.componentName === 'Fabric')?.id || '',
      colorOptionId: t.componentOptions?.find((o) => o.componentName === 'Color')?.id || ''
    })
  }, [presetDetail, form])

  const handleImageChange = (value: string) => {
    form.setValue('images', [value])
  }

  const handleInputChange = (field: keyof FormDataType, value: string | number | boolean) => {
    if (field === 'price') form.setValue(field, value as number)
    else if (field === 'isDefault') form.setValue(field, value as boolean)
    else form.setValue(field, value as string)
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

  const isLoadingSubmit = updateMutation.isPending

  const handleSubmit = async (data: FormDataType) => {
    if (!presetId) return

    const componentOptionIds = [
      data.hemOptionId,
      data.necklineOptionId,
      data.waistOptionId,
      data.sleevesOptionId,
      data.fabricOptionId,
      data.colorOptionId
    ].filter(Boolean)

    const payload: PresetFormData = {
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
      await updateMutation.mutateAsync({ id: presetId, data: payload })
      toast.success('Cập nhật preset thành công!')
      onSuccess?.()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Cập nhật preset thất bại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-4xl max-h-[95vh] overflow-y-auto'>
        <DialogHeader className='text-center pb-4'>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-3'>
            <Sparkles className='h-8 w-8 text-blue-500' />
            Cập nhật Preset
          </DialogTitle>
          <DialogDescription className='text-base text-center text-gray-600 mt-3'>
            Chỉnh sửa các thông tin của preset
          </DialogDescription>
        </DialogHeader>

        {/* Style Selection */}
        <div className='flex flex-row gap-6 mb-6'>
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
        </div>

        {/* Name and Price */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
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

        {/* Component Options Selectors */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='space-y-2'>
            <Label className='font-medium'>Hem (Viền)</Label>
            <Select value={formData.hemOptionId} onValueChange={(v) => handleInputChange('hemOptionId', v)}>
              <SelectTrigger className={`${errors.hemOptionId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn kiểu viền' />
              </SelectTrigger>
              <SelectContent>
                {hemOptions.map((o: ComponentOptionType) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='font-medium'>Neckline (Cổ áo)</Label>
            <Select value={formData.necklineOptionId} onValueChange={(v) => handleInputChange('necklineOptionId', v)}>
              <SelectTrigger className={`${errors.necklineOptionId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn kiểu cổ áo' />
              </SelectTrigger>
              <SelectContent>
                {necklineOptions.map((o: ComponentOptionType) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='font-medium'>Waist (Eo)</Label>
            <Select value={formData.waistOptionId} onValueChange={(v) => handleInputChange('waistOptionId', v)}>
              <SelectTrigger className={`${errors.waistOptionId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn kiểu eo' />
              </SelectTrigger>
              <SelectContent>
                {waistOptions.map((o: ComponentOptionType) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='font-medium'>Sleeves (Tay áo)</Label>
            <Select value={formData.sleevesOptionId} onValueChange={(v) => handleInputChange('sleevesOptionId', v)}>
              <SelectTrigger className={`${errors.sleevesOptionId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn kiểu tay áo' />
              </SelectTrigger>
              <SelectContent>
                {sleevesOptions.map((o: ComponentOptionType) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='font-medium'>Fabric (Chất liệu)</Label>
            <Select value={formData.fabricOptionId} onValueChange={(v) => handleInputChange('fabricOptionId', v)}>
              <SelectTrigger className={`${errors.fabricOptionId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn chất liệu' />
              </SelectTrigger>
              <SelectContent>
                {fabricOptions.map((o: ComponentOptionType) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label className='font-medium'>Color (Màu sắc)</Label>
            <Select value={formData.colorOptionId} onValueChange={(v) => handleInputChange('colorOptionId', v)}>
              <SelectTrigger className={`${errors.colorOptionId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder='Chọn màu sắc' />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((o: ComponentOptionType) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className='my-6' />

        {/* Image Upload */}
        <div className='w-full p-6 bg-white rounded-xl shadow-lg border border-gray-200 mb-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Palette className='h-5 w-5 text-purple-500' />
            <h3 className='text-lg font-semibold text-gray-800'>Tải Lên Hình Ảnh</h3>
          </div>
          <SingleImageUpload value={formData.images[0] || ''} onChange={handleImageChange} className='w-full' />
          {errors.images && (
            <p className='text-sm text-red-500 mt-2 text-center flex items-center justify-center gap-1'>
              <AlertCircle className='h-4 w-4' />
              {errors.images.message}
            </p>
          )}
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
                className='px-8 py-3 text-base'
                disabled={isLoadingSubmit}
              >
                Hủy
              </Button>
              <Button
                type='button'
                onClick={form.handleSubmit(handleSubmit)}
                disabled={!isFormValid || isLoadingSubmit}
                className='px-10 py-3 text-base'
              >
                {isLoadingSubmit ? (
                  <>
                    <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-5 w-5 mr-2' />
                    Lưu thay đổi
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
