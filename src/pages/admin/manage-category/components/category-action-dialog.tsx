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
import { useCreateCategory, useUpdateCategory } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { Category } from '../data/schema'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export const formSchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  description: z.string().optional(),
  images: z.array(z.string()).optional()
})

export type CategoryForm = z.infer<typeof formSchema>

interface Props {
  open: boolean
  currentRow?: Category
  onOpenChange: (open: boolean) => void
}

export function CategoryFormDialog({ open, onOpenChange, currentRow }: Props) {
  const isEdit = !!currentRow
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()

  const form = useForm<CategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          description: currentRow.description || '',
          images: currentRow.images || []
        }
      : {
          name: '',
          description: '',
          images: []
        }
  })

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (isEdit && currentRow) {
        await updateCategoryMutation.mutateAsync({
          id: currentRow.id,
          data: {
            ...data,
            description: data.description || '',
            images: data.images || []
          }
        })
        toast.success('Update category successfully!')
      } else {
        await createCategoryMutation.mutateAsync({
          ...data,
          description: data.description || '',
          images: data.images || []
        })
        toast.success('Create category successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'

      toast.error(`${isEdit ? 'Failed to update' : 'Failed to create'} category: ${errorMessage}`)
    }
  }

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending

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
          <DialogTitle>{isEdit ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update category information. Fields with * are required.'
              : 'Create new category for office dress. Fields with * are required.'}
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='category-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-0.5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='items-center space-y-2 gap-x-4 gap-y-1'>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input placeholder='eg: Office Dress' {...field} disabled={isSubmitting} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Description of category...' rows={3} {...field} disabled={isSubmitting} />
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
                    <FormLabel>Category Images</FormLabel>
                    <FormControl>
                      <FirebaseImageUpload
                        value={field.value || []}
                        onChange={field.onChange}
                        maxFiles={5}
                        placeholder='Upload category images or enter URL'
                        disabled={isSubmitting}
                        uploadOptions={{
                          folder: 'categories/', // Tổ chức ảnh theo thư mục
                          metadata: {
                            customMetadata: {
                              type: 'category'
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
          <Button type='submit' form='category-form' disabled={isSubmitting}>
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
