import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Category, CategoryFormData } from '@/@types/admin.types'

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSubmit: (data: CategoryFormData) => void
}

const schema = yup.object({
  name: yup.string().required('Category name is required').min(2, 'Name must be at least 2 characters')
})

export default function CategoryFormDialog({ open, onOpenChange, category, onSubmit }: CategoryFormDialogProps) {
  const isEditing = !!category

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: ''
    }
  })

  useEffect(() => {
    if (category) {
      reset({
        name: category.name
      })
    } else {
      reset({
        name: ''
      })
    }
  }, [category, reset])

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data)
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the category information below.' : 'Enter the details for the new category.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Category Name</Label>
            <Input
              id='name'
              placeholder='Enter category name'
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className='text-sm text-red-500'>{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
