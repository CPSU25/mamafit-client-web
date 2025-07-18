'use client'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FirebaseImageUpload } from '@/components/firebase-image-upload'
import { useCreateComponent, useUpdateComponent } from '@/services/admin/manage-component.service'
import { toast } from 'sonner'
import { Component } from '../data/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Component name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  images: z.array(z.string()).optional()
})

export type ComponentForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  currentRow?: Component
  onOpenChange: (open: boolean) => void
}

export function ComponentFormDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const createComponentMutation = useCreateComponent()
  const updateComponentMutation = useUpdateComponent()

  const form = useForm<ComponentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description,
          images: currentRow.images || []
        }
      : {
          name: '',
          description: '',
          images: []
        }
  })

  const onSubmit = async (data: ComponentForm) => {
    try {
      if (isEdit && currentRow) {
        await updateComponentMutation.mutateAsync({
          id: currentRow.id,
          data: {
            ...data,
            images: data.images || []
          }
        })
        toast.success('Update component successfully!')
      } else {
        await createComponentMutation.mutateAsync({
          ...data,
          images: data.images || []
        })
        toast.success('Create component successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`${isEdit ? 'Failed to update' : 'Failed to create'} component: ${errorMessage}`)
    }
  }

  const isSubmitting = createComponentMutation.isPending || updateComponentMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Component' : 'Create New Component'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update component information. Fields with * are required.'
              : 'Create new component for the system. Fields with * are required.'}
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='component-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-0.5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Component Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='eg: Button, Input, Card' {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Description of component...' rows={3} {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='images'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Component Images</FormLabel>
                    <FormControl>
                      <FirebaseImageUpload
                        value={field.value || []}
                        onChange={(value) => field.onChange(value)}
                        maxFiles={5}
                        placeholder='Upload component images or enter URL'
                        disabled={isSubmitting}
                        uploadOptions={{
                          folder: 'components/', // Tổ chức ảnh theo thư mục
                          metadata: {
                            customMetadata: {
                              type: 'component'
                            }
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='component-form' disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
