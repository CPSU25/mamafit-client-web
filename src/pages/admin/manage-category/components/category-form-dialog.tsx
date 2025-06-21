import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useCreateCategory, useUpdateCategory } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { CategoryFormData, CategoryType } from '@/@types/inventory.type'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  currentCategory?: CategoryType | null
}

export function CategoryFormDialog({ 
  open, 
  onOpenChange, 
  mode, 
  currentCategory 
}: CategoryFormDialogProps) {
  const isEdit = mode === 'edit'
  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      image: []
    }
  })

  // Reset form when mode or currentCategory changes
  useEffect(() => {
    if (isEdit && currentCategory) {
      form.reset({
        name: currentCategory.name,
        description: currentCategory.description || '',
        image: currentCategory.images || []
      })
    } else {
      form.reset({
        name: '',
        description: '',
        image: []
      })
    }
  }, [isEdit, currentCategory, form])

  // Reset mutations when dialog opens
  useEffect(() => {
    if (open) {
      createCategoryMutation.reset()
      updateCategoryMutation.reset()
    }
  }, [open, createCategoryMutation, updateCategoryMutation])

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (isEdit && currentCategory) {
        await updateCategoryMutation.mutateAsync({
          id: currentCategory.id,
          data
        })
        toast.success('Cập nhật danh mục thành công!')
      } else {
        await createCategoryMutation.mutateAsync(data)
        toast.success('Tạo danh mục thành công!')
      }
      
      handleClose()
    } catch (error: unknown) {
      console.error('Error submitting form:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'
      
      toast.error(`${isEdit ? 'Lỗi cập nhật' : 'Lỗi tạo'} danh mục: ${errorMessage}`)
      
      // Reset mutation states but keep dialog open for retry
      createCategoryMutation.reset()
      updateCategoryMutation.reset()
    }
  }

  const handleClose = () => {
    form.reset()
    createCategoryMutation.reset()
    updateCategoryMutation.reset()
    onOpenChange(false)
  }

  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              rules={{ required: 'Tên danh mục là bắt buộc' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Danh Mục *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='VD: Đầm bầu công sở'
                      {...field}
                      disabled={isSubmitting}
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
                <FormItem>
                  <FormLabel>Mô Tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Mô tả về danh mục...'
                      rows={3}
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {isSubmitting && (
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' aria-hidden="true" />
                )}
                {isEdit ? 'Cập Nhật' : 'Tạo Mới'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 