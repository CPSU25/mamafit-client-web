'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Settings, Save, RefreshCw, X, Sparkles } from 'lucide-react'
import { useGetConfigs, useUpdateConfig } from '@/services/global/system-config.service'
import { ConfigFormData } from '@/@types/system-config.types'
import { configPatchSchema, type ConfigPatch } from './schema'

type TagEditorProps = {
  value: string[] | undefined
  onChange: (next: string[]) => void
  placeholder?: string
}
function TagEditor({ value = [], onChange, placeholder }: TagEditorProps) {
  const [text, setText] = React.useState('')
  const add = () => {
    const v = text.trim()
    if (!v) return
    const next = Array.from(new Set([...value, v]))
    onChange(next)
    setText('')
  }
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add()
    }
    if (e.key === 'Backspace' && text === '' && value.length > 0) {
      const next = value.slice(0, -1)
      onChange(next)
    }
  }
  const remove = (idx: number) => {
    const next = value.filter((_, i) => i !== idx)
    onChange(next)
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-md border p-2'>
      {value.map((tag, i) => (
        <Badge key={`${tag}-${i}`} variant='secondary' className='flex items-center gap-1'>
          {tag}
          <button type='button' onClick={() => remove(i)} className='hover:opacity-70'>
            <X className='h-3 w-3' />
          </button>
        </Badge>
      ))}
      <input
        className='flex-1 min-w-[160px] outline-none bg-transparent px-1 py-1 text-sm'
        placeholder={placeholder ?? 'Nhập và nhấn Enter'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button type='button' variant='secondary' size='sm' onClick={add}>
        Thêm
      </Button>
    </div>
  )
}

const SystemConfig = () => {
  const { data: configResponse, isLoading, error, refetch } = useGetConfigs()
  const updateConfigMutation = useUpdateConfig()

  const form = useForm<ConfigPatch>({
    resolver: zodResolver(configPatchSchema),
    defaultValues: {}
  })

  React.useEffect(() => {
    if (configResponse?.data.fields) {
      const f = configResponse.data.fields
      form.reset(
        {
          name: f.name ?? 'MamaFit',
          designRequestServiceFee: f.designRequestServiceFee,
          depositRate: f.depositRate,
          presetVersions: f.presetVersions,
          warrantyTime: f.warrantyTime,
          appointmentSlotInterval: f.appointmentSlotInterval,
          maxAppointmentPerDay: f.maxAppointmentPerDay,
          maxAppointmentPerUser: f.maxAppointmentPerUser,
          warrantyPeriod: f.warrantyPeriod,
          colors: f.colors ?? [],
          sizes: f.sizes ?? [],
          jobTitles: f.jobTitles ?? []
        },
        { keepDefaultValues: false }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configResponse])

  const onSubmit = async (data: ConfigFormData) => {
    const dirty = form.formState.dirtyFields
    const payload: ConfigFormData = {}

    for (const key in dirty) {
      // @ts-expect-error index type ok
      payload[key] = (data as ConfigFormData)[key]
    }

    try {
      await updateConfigMutation.mutateAsync(payload)
      toast.success('Cập nhật cấu hình hệ thống thành công!')
      form.reset(data)
    } catch (err) {
      toast.error('Cập nhật cấu hình thất bại. Vui lòng thử lại!')
      console.error('Update config error:', err)
    }
  }

  const handleRefresh = () => {
    refetch()
    toast.info('Đã làm mới dữ liệu cấu hình')
  }

  if (isLoading) {
    return (
      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-4 w-96' />
            </div>
            <Skeleton className='h-10 w-32' />
          </div>
          <div className='grid gap-6 md:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-48' />
                  <Skeleton className='h-4 w-64' />
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Skeleton className='h-20 w-full' />
                  <Skeleton className='h-20 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main>
        <div className='container mx-auto py-6'>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Không thể tải cấu hình hệ thống. Vui lòng thử lại.'}
            </AlertDescription>
          </Alert>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                <Settings className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                  Cấu hình hệ thống
                </h1>
                <p className='text-sm text-muted-foreground flex items-center gap-1'>
                  Quản lý các thông số cấu hình cho toàn bộ hệ thống MamaFit
                  <Sparkles className='h-3 w-3 text-violet-500' />
                </p>
              </div>
            </div>
          </div>
          <Button variant='outline' onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className='h-4 w-4' />
            Làm mới
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình dịch vụ</CardTitle>
                  <CardDescription>Thiết lập phí dịch vụ và tỷ lệ thanh toán</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='designRequestServiceFee'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phí yêu cầu thiết kế riêng</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Phí dịch vụ cho yêu cầu thiết kế riêng với designer (VNĐ)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='depositRate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tỷ lệ đặt cọc</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            max='1'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Tỷ lệ tiền cọc từ 0-1 (0.3 = 30%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình thiết kế</CardTitle>
                  <CardDescription>Thiết lập số lượng version và preset</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='presetVersions'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng version mặc định</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Số lượng version mặc định cho mỗi thiết kế</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình bảo hành</CardTitle>
                  <CardDescription>Thiết lập chính sách bảo hành sản phẩm</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='warrantyTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lần miễn phí bảo hành</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Số lần khách hàng được bảo hành miễn phí</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='warrantyPeriod'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thời gian bảo hành (ngày)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Thời gian bảo hành tính bằng ngày</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình lịch hẹn</CardTitle>
                  <CardDescription>Thiết lập quy tắc đặt lịch hẹn</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='appointmentSlotInterval'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Khoảng thời gian giữa các slot (phút)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Thời gian giữa các slot đặt lịch (phút)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='maxAppointmentPerDay'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng tối đa appointment/ngày</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Số lượng tối đa appointment trong 1 ngày</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='maxAppointmentPerUser'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng tối đa appointment/user</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Số lượng tối đa user có thể đặt appointment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thuộc tính mặc định khi tạo váy</CardTitle>
                  <CardDescription>Quản lý danh sách Colors, Sizes và Job Titles</CardDescription>
                </CardHeader>
                <CardContent className='grid gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='colors'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colors</FormLabel>
                        <FormControl>
                          <TagEditor value={field.value} onChange={field.onChange} placeholder='Nhập màu và Enter' />
                        </FormControl>
                        <FormDescription>Ví dụ: red, yellow, black…</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='sizes'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sizes</FormLabel>
                        <FormControl>
                          <TagEditor value={field.value} onChange={field.onChange} placeholder='Nhập size và Enter' />
                        </FormControl>
                        <FormDescription>Ví dụ: M, L, XL…</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cấu hình chức vụ nhân viên</CardTitle>
                  <CardDescription>Thiết lập chức vụ nhân viên trong hệ thống </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='jobTitles'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel>Job Titles</FormLabel>
                        <FormControl>
                          <TagEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder='Nhập chức danh và Enter'
                          />
                        </FormControl>
                        <FormDescription>Ví dụ: Designer, Branch Manager…</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className='flex justify-end'>
              <Button type='submit' isLoading={updateConfigMutation.isPending} disabled={!form.formState.isDirty}>
                <Save className='h-4 w-4' />
                Lưu cấu hình
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Main>
  )
}

export default SystemConfig
