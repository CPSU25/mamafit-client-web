'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { FirebaseSingleImageUpload } from '@/components/firebase-single-image-upload'
import { Branch } from '../data/schema'
import { useCreateBranch, useUpdateBranch } from '@/services/admin/manage-branch.service'
import { useGetListUser } from '@/services/admin/manage-user.service'
import { BranchRequest } from '@/@types/branch.type'
import { ManageUserType } from '@/@types/admin.types'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Tên chi nhánh là bắt buộc.' }),
  description: z.string().min(1, { message: 'Mô tả là bắt buộc.' }),
  openingHour: z
    .string()
    .min(1, { message: 'Giờ mở cửa là bắt buộc.' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'Vui lòng nhập đúng định dạng thời gian (HH:MM hoặc HH:MM:SS).'
    }),
  closingHour: z
    .string()
    .min(1, { message: 'Giờ đóng cửa là bắt buộc.' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'Vui lòng nhập đúng định dạng thời gian (HH:MM hoặc HH:MM:SS).'
    }),
  branchManagerId: z.string().min(1, { message: 'Quản lý chi nhánh là bắt buộc.' }),
  mapId: z.string().optional(),
  province: z.string().min(1, { message: 'Tỉnh/Thành phố là bắt buộc.' }),
  district: z.string().min(1, { message: 'Quận/Huyện là bắt buộc.' }),
  ward: z.string().min(1, { message: 'Phường/Xã là bắt buộc.' }),
  street: z.string().min(1, { message: 'Địa chỉ cụ thể là bắt buộc.' }),
  latitude: z.number(),
  longitude: z.number(),
  images: z.array(z.string()).optional()
})

type BranchForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: Branch
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BranchActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const createBranchMutation = useCreateBranch()
  const updateBranchMutation = useUpdateBranch()

  const { data: branchManagersData, isLoading: isLoadingManagers } = useGetListUser({
    roleName: 'BranchManager',
    pageSize: 100
  })

  const form = useForm<BranchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name || '',
          description: currentRow.description || '',
          openingHour: currentRow.openingHour || '',
          closingHour: currentRow.closingHour || '',
          branchManagerId: currentRow.branchManager.id || '',
          mapId: currentRow.mapId || '',
          province: currentRow.province || '',
          district: currentRow.district || '',
          ward: currentRow.ward || '',
          street: currentRow.street || '',
          latitude: currentRow.latitude || 0,
          longitude: currentRow.longitude || 0,
          images: currentRow.images || []
        }
      : {
          name: '',
          description: '',
          openingHour: '',
          closingHour: '',
          branchManagerId: '',
          mapId: '',
          province: '',
          district: '',
          ward: '',
          street: '',
          latitude: 0,
          longitude: 0,
          images: []
        }
  })

  const onSubmit = async (values: BranchForm) => {
    try {
      // Transform the data to match BranchRequest schema
      const branchData: BranchRequest = {
        name: values.name,
        description: values.description,
        openingHour: values.openingHour,
        closingHour: values.closingHour,
        branchManagerId: values.branchManagerId,
        mapId: values.mapId || '',
        province: values.province,
        district: values.district,
        ward: values.ward,
        street: values.street,
        latitude: values.latitude,
        longitude: values.longitude,
        images: values.images || []
      }

      if (isEdit && currentRow) {
        await updateBranchMutation.mutateAsync({
          id: currentRow.id,
          ...branchData
        })
        toast.success('Cập nhật chi nhánh thành công!')
      } else {
        await createBranchMutation.mutateAsync(branchData)
        toast.success('Tạo chi nhánh thành công!')
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(isEdit ? 'Không thể cập nhật chi nhánh' : 'Không thể tạo chi nhánh')
      console.error('Error:', error)
    }
  }

  const isLoading = createBranchMutation.isPending || updateBranchMutation.isPending

  // Prepare branch manager options
  const branchManagerOptions =
    branchManagersData?.data?.items?.map((user: ManageUserType) => ({
      label: `${user.fullName} (${user.userEmail})`,
      value: user.id
    })) || []

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          form.reset()
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh]'>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-xl font-semibold bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
            {isEdit ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {isEdit ? 'Cập nhật thông tin chi nhánh. ' : 'Tạo chi nhánh mới trong hệ thống. '}
            Nhấn lưu khi hoàn thành.
          </DialogDescription>
        </DialogHeader>

        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='branch-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-0.5'>
              {/* Thông tin cơ bản */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-violet-200 dark:border-violet-800'>
                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-violet-600'></div>
                  <h3 className='text-lg font-semibold text-foreground'>Thông tin cơ bản</h3>
                </div>

                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-right font-medium'>Tên chi nhánh</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Chi nhánh Bình Dương'
                          className='col-span-4 border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-right font-medium pt-2'>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Mô tả về chi nhánh...'
                          className='col-span-4 border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600 resize-none'
                          rows={3}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              </div>

              {/* Giờ hoạt động */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-violet-200 dark:border-violet-800'>
                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600'></div>
                  <h3 className='text-lg font-semibold text-foreground'>Giờ hoạt động</h3>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='openingHour'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='font-medium'>Giờ mở cửa</FormLabel>
                        <FormControl>
                          <Input
                            type='time'
                            step='1'
                            className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='closingHour'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='font-medium'>Giờ đóng cửa</FormLabel>
                        <FormControl>
                          <Input
                            type='time'
                            step='1'
                            className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Quản lý */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-violet-200 dark:border-violet-800'>
                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600'></div>
                  <h3 className='text-lg font-semibold text-foreground'>Quản lý</h3>
                </div>

                <FormField
                  control={form.control}
                  name='branchManagerId'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-right font-medium'>Quản lý chi nhánh</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder={isLoadingManagers ? 'Đang tải...' : 'Chọn quản lý chi nhánh'}
                        className='col-span-4'
                        disabled={isLoading || isLoadingManagers}
                        items={branchManagerOptions}
                      />
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              </div>

              {/* Địa chỉ */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-violet-200 dark:border-violet-800'>
                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600'></div>
                  <h3 className='text-lg font-semibold text-foreground'>Địa chỉ</h3>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='province'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='font-medium'>Tỉnh/Thành phố</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Bình Dương'
                            className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='district'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='font-medium'>Quận/Huyện</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Thị xã Thuận An'
                            className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='ward'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='font-medium'>Phường/Xã</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Phường An Phú'
                            className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='street'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='font-medium'>Địa chỉ cụ thể</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='123 Đường ABC'
                            className='border-violet-200 dark:border-violet-800 focus:border-violet-400 dark:focus:border-violet-600'
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Hình ảnh */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-violet-200 dark:border-violet-800'>
                  <div className='w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-pink-600'></div>
                  <h3 className='text-lg font-semibold text-foreground'>Hình ảnh</h3>
                </div>

                <FormField
                  control={form.control}
                  name='images'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-right font-medium pt-2'>Hình ảnh chi nhánh</FormLabel>
                      <FormControl>
                        <FirebaseSingleImageUpload
                          value={field.value?.[0] || ''}
                          onChange={(url) => field.onChange(url ? [url] : [])}
                          placeholder='Tải lên hình ảnh chi nhánh'
                          className='col-span-4 w-full'
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className='pt-4 border-t border-violet-200 dark:border-violet-800'>
          <Button
            type='submit'
            form='branch-form'
            disabled={isLoading}
            className='bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
          >
            {isLoading ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
