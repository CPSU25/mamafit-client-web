'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useUpdateUser, useCreateSystemAccount, useGetRoles } from '@/services/admin/manage-user.service'
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
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { User } from '../data/schema'

const formSchema = z
  .object({
    fullName: z.string().min(1, { message: 'Họ tên là bắt buộc.' }),
    userName: z.string().min(1, { message: 'Tên đăng nhập là bắt buộc.' }),
    phoneNumber: z.string().min(1, { message: 'Số điện thoại là bắt buộc.' }),
    userEmail: z.string().min(1, { message: 'Email là bắt buộc.' }).email({ message: 'Email không hợp lệ.' }),
    password: z.string().transform((pwd) => pwd.trim()),
    roleId: z.string().min(1, { message: 'Vai trò là bắt buộc.' }),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean()
  })
  .superRefine(({ isEdit, password, confirmPassword }, ctx) => {
    if (!isEdit || (isEdit && password !== '')) {
      if (password === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu là bắt buộc.',
          path: ['password']
        })
      }

      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu phải có ít nhất 8 ký tự.',
          path: ['password']
        })
      }

      if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu phải chứa ít nhất một chữ cái thường.',
          path: ['password']
        })
      }

      if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu phải chứa ít nhất một số.',
          path: ['password']
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mật khẩu xác nhận không khớp.',
          path: ['confirmPassword']
        })
      }
    }
  })
type SystemAccountForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const updateUserMutation = useUpdateUser()
  const createSystemAccountMutation = useCreateSystemAccount()

  // Fetch roles from API
  const { data: rolesData, isLoading: rolesLoading } = useGetRoles()

  const form = useForm<SystemAccountForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          fullName: currentRow.fullName || '',
          userName: currentRow.userName || '',
          userEmail: currentRow.userEmail || '',
          roleId: '', // Will be set when roles data is loaded
          phoneNumber: currentRow.phoneNumber || '',
          password: '',
          confirmPassword: '',
          isEdit
        }
      : {
          fullName: '',
          userName: '',
          userEmail: '',
          roleId: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          isEdit
        }
  })

  // Update roleId when roles data is loaded and we're in edit mode
  useEffect(() => {
    // Helper function to find roleId by roleName for edit mode
    const findRoleIdByName = (roleName: string) => {
      if (!rolesData?.data?.items) return ''
      const role = rolesData.data.items.find((r) => r.roleName.toLowerCase() === roleName.toLowerCase())
      return role?.id || ''
    }

    if (isEdit && currentRow && rolesData?.data?.items) {
      const roleId = findRoleIdByName(currentRow.roleName || '')
      form.setValue('roleId', roleId)
    }
  }, [isEdit, currentRow, rolesData, form])

  const onSubmit = async (values: SystemAccountForm) => {
    try {
      if (isEdit && currentRow) {
        // Find role name from roleId for update
        const selectedRole = rolesData?.data?.items?.find((r) => r.id === values.roleId)

        const updateData = {
          id: currentRow.id,
          userName: values.userName,
          userEmail: values.userEmail,
          fullName: values.fullName,
          phoneNumber: values.phoneNumber,
          roleName: selectedRole?.roleName || '',
          dateOfBirth: currentRow.dateOfBirth || '',
          profilePicture: currentRow.profilePicture || '',
          isVerify: currentRow.isVerify,
          createdAt: currentRow.createdAt,
          updatedAt: new Date().toISOString()
        }

        await updateUserMutation.mutateAsync({
          id: currentRow.id,
          data: updateData
        })

        toast.success('Cập nhật tài khoản thành công!')
      } else {
        // Create new system account using the new API
        const createData = {
          userName: values.userName,
          fullName: values.fullName,
          password: values.password,
          userEmail: values.userEmail,
          phoneNumber: values.phoneNumber,
          roleId: values.roleId
        }

        await createSystemAccountMutation.mutateAsync(createData)
        toast.success('Tạo tài khoản hệ thống thành công!')
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(isEdit ? 'Không thể cập nhật tài khoản' : 'Không thể tạo tài khoản hệ thống')
      console.error('Error:', error)
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password
  const isLoading = updateUserMutation.isPending || createSystemAccountMutation.isPending

  // Prepare role options from API data
  const roleOptions =
    rolesData?.data?.items?.map((role) => ({
      label: role.roleName,
      value: role.id
    })) || []

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản hệ thống mới'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin tài khoản. ' : 'Tạo tài khoản hệ thống mới. '}
            Nhấn lưu khi hoàn thành.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='user-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-0.5'>
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Họ và tên</FormLabel>
                    <FormControl>
                      <Input placeholder='Nguyễn Văn A' className='col-span-4' autoComplete='off' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='userName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder='nguyen_van_a' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='userEmail'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='nguyen.van.a@gmail.com' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder='0987654321' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roleId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Vai trò</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={rolesLoading ? 'Đang tải...' : 'Chọn vai trò'}
                      className='col-span-4'
                      disabled={rolesLoading}
                      items={roleOptions}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Mật khẩu</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder='Ít nhất 8 ký tự' className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Xác nhận mật khẩu</FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='Nhập lại mật khẩu'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isLoading}>
            {isLoading ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 'Lưu thay đổi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
