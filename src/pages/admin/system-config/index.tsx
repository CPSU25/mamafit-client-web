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
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Settings, Save, RefreshCw } from 'lucide-react'
import { useGetConfigs, useUpdateConfig } from '@/services/global/system-config.service'
import { ConfigFormData } from '@/@types/system-config.types'
import configSchema from './schema'

const SystemConfig = () => {
  // Fetch config data
  const { data: configResponse, isLoading, error, refetch } = useGetConfigs()
  // Update mutation
  const updateConfigMutation = useUpdateConfig()

  // Form setup
  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      name: 'MamaFit',
      designRequestServiceFee: 0,
      depositRate: 0,
      presetVersions: 1,
      warrantyTime: 0,
      appointmentSlotInterval: 30,
      maxAppointmentPerDay: 10,
      maxAppointmentPerUser: 3,
      warrantyPeriod: 30
    }
  })

  // Update form when data is loaded
  React.useEffect(() => {
    if (configResponse?.data.fields) {
      form.reset({
        name: configResponse.data.fields.name,
        designRequestServiceFee: configResponse.data.fields.designRequestServiceFee,
        depositRate: configResponse.data.fields.depositRate,
        presetVersions: configResponse.data.fields.presetVersions,
        warrantyTime: configResponse.data.fields.warrantyTime,
        appointmentSlotInterval: configResponse.data.fields.appointmentSlotInterval,
        maxAppointmentPerDay: configResponse.data.fields.maxAppointmentPerDay,
        maxAppointmentPerUser: configResponse.data.fields.maxAppointmentPerUser,
        warrantyPeriod: configResponse.data.fields.warrantyPeriod
      })
    }
  }, [configResponse, form])

  const onSubmit = async (data: ConfigFormData) => {
    try {
      await updateConfigMutation.mutateAsync(data)
      toast.success('Cập nhật cấu hình hệ thống thành công!')
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
        <div className='container mx-auto py-6 space-y-6'>
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
      <div className='container mx-auto py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Settings className='h-6 w-6' />
              <h1 className='text-2xl font-bold tracking-tight'>Cấu hình hệ thống</h1>
            </div>
            <p className='text-muted-foreground'>Quản lý các thông số cấu hình cho toàn bộ hệ thống MamaFit</p>
          </div>
          <Button variant='outline' onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className='h-4 w-4' />
            Làm mới
          </Button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Cấu hình dịch vụ */}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Tỷ lệ tiền cọc từ 0-1 (0.3 = 30%)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Cấu hình thiết kế */}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Số lượng version mặc định cho mỗi thiết kế</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Cấu hình bảo hành */}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Thời gian bảo hành tính bằng ngày</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Cấu hình lịch hẹn */}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
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
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>Số lượng tối đa user có thể đặt appointment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Submit button */}
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
