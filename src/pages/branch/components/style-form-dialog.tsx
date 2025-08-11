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
import { Style, StyleFormData } from '@/@types/admin.types'

interface StyleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  style?: Style | null
  onSubmit: (data: StyleFormData) => void
}

const schema = yup.object({
  name: yup.string().required('Style name is required').min(2, 'Name must be at least 2 characters')
})

export default function StyleFormDialog({ open, onOpenChange, style, onSubmit }: StyleFormDialogProps) {
  const isEditing = !!style

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<StyleFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: ''
    }
  })

  useEffect(() => {
    if (style) {
      reset({
        name: style.name
      })
    } else {
      reset({
        name: ''
      })
    }
  }, [style, reset])

  const handleFormSubmit = async (data: StyleFormData) => {
    await onSubmit(data)
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Style' : 'Add New Style'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the style information below.' : 'Enter the details for the new style.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Style Name</Label>
            <Input
              id='name'
              placeholder='Enter style name'
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
