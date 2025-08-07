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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FirebaseSingleImageUpload } from '@/components/firebase-single-image-upload'
import { AddressForm } from '@/components/address-form'
import { Branch } from '../data/schema'
import { useCreateBranch, useUpdateBranch } from '@/services/admin/manage-branch.service'
import { useGetListUser } from '@/services/admin/manage-user.service'
import { BranchRequest } from '@/@types/branch.type'
import { ManageUserType } from '@/@types/admin.types'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Branch name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  openingHour: z
    .string()
    .min(1, { message: 'Opening time is required.' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'Please enter a valid time format (HH:MM or HH:MM:SS).'
    }),
  closingHour: z
    .string()
    .min(1, { message: 'Closing time is required.' })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
      message: 'Please enter a valid time format (HH:MM or HH:MM:SS).'
    }),
  branchManagerId: z.string().min(1, { message: 'Branch manager ID is required.' }),
  mapId: z.string().optional(),
  province: z.string().min(1, { message: 'Province is required.' }),
  district: z.string().min(1, { message: 'District is required.' }),
  ward: z.string().min(1, { message: 'Ward is required.' }),
  street: z.string().min(1, { message: 'Street is required.' }),
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
    pageSize: 10
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
        toast.success('Branch updated successfully!')
      } else {
        await createBranchMutation.mutateAsync(branchData)
        toast.success('Branch created successfully!')
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(isEdit ? 'Failed to update branch' : 'Failed to create branch')
      console.error('Error:', error)
    }
  }

  const isLoading = createBranchMutation.isPending || updateBranchMutation.isPending

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
      <DialogContent className='sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='text-left pb-6'>
          <DialogTitle className='text-xl font-semibold'>{isEdit ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {isEdit ? 'Update the branch details here. ' : 'Create new branch here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-2'>
          <Form {...form}>
            <form id='branch-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
              {/* Basic Information Section */}
              <div className='space-y-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-lg font-medium text-foreground'>Basic Information</h3>
                  <p className='text-sm text-muted-foreground'>General details about the branch</p>
                </div>

                <div className='grid grid-cols-1 gap-6'>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='text-sm font-medium'>Branch Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Main Branch'
                            className='transition-all duration-200 focus:ring-2 focus:ring-primary/20'
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
                    name='description'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='text-sm font-medium'>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Branch description...'
                            className='resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20'
                            rows={4}
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

              {/* Operating Hours Section */}
              <div className='space-y-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-lg font-medium text-foreground'>Operating Hours</h3>
                  <p className='text-sm text-muted-foreground'>Set the branch operating schedule</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <FormField
                    control={form.control}
                    name='openingHour'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel className='text-sm font-medium'>Opening Time</FormLabel>
                        <FormControl>
                          <Input
                            type='time'
                            step='1'
                            className='transition-all duration-200 focus:ring-2 focus:ring-primary/20'
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
                        <FormLabel className='text-sm font-medium'>Closing Time</FormLabel>
                        <FormControl>
                          <Input
                            type='time'
                            step='1'
                            className='transition-all duration-200 focus:ring-2 focus:ring-primary/20'
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

              {/* Management Section */}
              <div className='space-y-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-lg font-medium text-foreground'>Management</h3>
                  <p className='text-sm text-muted-foreground'>Assign branch manager</p>
                </div>

                <FormField
                  control={form.control}
                  name='branchManagerId'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='text-sm font-medium'>Branch Manager</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoading || isLoadingManagers}
                        >
                          <SelectTrigger className='transition-all duration-200 focus:ring-2 focus:ring-primary/20'>
                            <SelectValue placeholder='Select a branch manager' />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingManagers ? (
                              <SelectItem value='loading' disabled>
                                Loading managers...
                              </SelectItem>
                            ) : branchManagersData?.data?.items?.length === 0 ? (
                              <SelectItem value='no-managers' disabled>
                                No branch managers available
                              </SelectItem>
                            ) : (
                              branchManagersData?.data?.items?.map((user: ManageUserType) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.fullName} ({user.userEmail})
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Section */}
              <div className='space-y-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-lg font-medium text-foreground'>Location</h3>
                  <p className='text-sm text-muted-foreground'>Set the branch address and coordinates</p>
                </div>

                <div className='space-y-4'>
                  <AddressForm />
                </div>
              </div>

              {/* Media Section */}
              <div className='space-y-4'>
                <div className='border-b pb-2'>
                  <h3 className='text-lg font-medium text-foreground'>Media</h3>
                  <p className='text-sm text-muted-foreground'>Upload branch images</p>
                </div>

                <FormField
                  control={form.control}
                  name='images'
                  render={({ field }) => (
                    <FormItem className='space-y-2'>
                      <FormLabel className='text-sm font-medium'>Branch Image</FormLabel>
                      <FormControl>
                        <FirebaseSingleImageUpload
                          value={field.value?.[0] || ''}
                          onChange={(url) => field.onChange(url ? [url] : [])}
                          placeholder='Upload branch image'
                          className='w-full transition-all duration-200'
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className='pt-6 border-t'>
          <Button
            type='submit'
            form='branch-form'
            disabled={isLoading}
            className='px-6 py-2 transition-all duration-200 hover:scale-105'
          >
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
