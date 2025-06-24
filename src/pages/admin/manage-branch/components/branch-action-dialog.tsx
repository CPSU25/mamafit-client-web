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
import { CloudinarySingleImageUpload } from '@/components/cloudinary-single-image-upload'
import { Branch } from '../data/schema'
import { useCreateBranch, useUpdateBranch } from '@/services/admin/branch.service'
import { BranchRequest } from '@/@types/branch.type'

const formSchema = z.object({
  name: z.string().min(1, { message: 'Branch name is required.' }),
  shortName: z.string().min(1, { message: 'Short name is required.' }),
  longName: z.string().min(1, { message: 'Long name is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  openingHours: z.string().min(1, { message: 'Opening hours is required.' }),
  branchManagerId: z.string().min(1, { message: 'Branch manager ID is required.' }),
  mapId: z.string().min(1, { message: 'Map ID is required.' }),
  latitude: z.string().min(1, { message: 'Latitude is required.' }),
  longitude: z.string().min(1, { message: 'Longitude is required.' }),
  image: z.string().optional()
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

  const form = useForm<BranchForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name || '',
          shortName: currentRow.shortName || '',
          longName: currentRow.longName || '',
          description: currentRow.description || '',
          openingHours: currentRow.openingHours || '',
          branchManagerId: currentRow.branchManagerId || '',
          mapId: currentRow.mapId || '',
          latitude: currentRow.latitude?.toString() || '',
          longitude: currentRow.longitude?.toString() || '',
          image: currentRow.images?.[0] || ''
        }
      : {
          name: '',
          shortName: '',
          longName: '',
          description: '',
          openingHours: '',
          branchManagerId: '',
          mapId: '',
          latitude: '',
          longitude: '',
          image: ''
        }
  })

  const onSubmit = async (values: BranchForm) => {
    try {
      // Transform the data to match BranchRequest schema
      const branchData: BranchRequest = {
        name: values.name,
        shortName: values.shortName,
        longName: values.longName,
        description: values.description,
        openingHours: values.openingHours,
        branchManagerId: values.branchManagerId,
        mapId: values.mapId,
        latitude: parseFloat(values.latitude),
        longitude: parseFloat(values.longitude),
        images: values.image ? [values.image] : []
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the branch details here. ' : 'Create new branch here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='branch-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-0.5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Branch Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Main Branch' className='col-span-4' disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='shortName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Short Name</FormLabel>
                    <FormControl>
                      <Input placeholder='MB001' className='col-span-4' disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='longName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Long Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Main Branch Location'
                        className='col-span-4'
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
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Branch description...'
                        className='col-span-4 resize-none'
                        rows={3}
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
                name='openingHours'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Opening Hours</FormLabel>
                    <FormControl>
                      <Input placeholder='9:00 AM - 6:00 PM' className='col-span-4' disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='branchManagerId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Manager ID</FormLabel>
                    <FormControl>
                      <Input placeholder='MGR001' className='col-span-4' disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='mapId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Map ID</FormLabel>
                    <FormControl>
                      <Input placeholder='MAP001' className='col-span-4' disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='latitude'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='10.762622'
                        type='number'
                        step='any'
                        className='col-span-4'
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
                name='longitude'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='106.660172'
                        type='number'
                        step='any'
                        className='col-span-4'
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
                name='image'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right pt-2'>Branch Image</FormLabel>
                    <FormControl>
                      <CloudinarySingleImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Upload branch image'
                        className='col-span-4'
                        disabled={isLoading}
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
          <Button type='submit' form='branch-form' disabled={isLoading}>
            {isLoading ? (isEdit ? 'Updating...' : 'Creating...') : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
