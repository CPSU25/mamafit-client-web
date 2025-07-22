import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { applyForOptions } from '../data/data'
import { Milestone } from '../data/schema'
import { useCreateMilestone, useUpdateMilestone } from '@/services/admin/manage-milestone.service'

const milestoneFormSchema = z.object({
  name: z.string().min(1, 'Milestone name is required').max(100, 'Milestone name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  applyFor: z.array(z.string()).min(1, 'Apply for is required'),
  sequenceOrder: z
    .number()
    .min(1, 'Sequence order must be greater than 0')
    .max(999, 'Sequence order must be less than 999')
})

type MilestoneFormData = z.infer<typeof milestoneFormSchema>

interface MilestoneFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Milestone
}

export function MilestoneFormDialog({ open, onOpenChange, currentRow }: MilestoneFormDialogProps) {
  const isEditing = !!currentRow

  const createMilestoneMutation = useCreateMilestone()
  const updateMilestoneMutation = useUpdateMilestone()

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: isEditing
      ? {
          name: currentRow?.name || '',
          description: currentRow?.description || '',
          applyFor: currentRow?.applyFor || [],
          sequenceOrder: currentRow?.sequenceOrder || 1
        }
      : {
          name: '',
          description: '',
          applyFor: [],
          sequenceOrder: 1
        }
  })

  const onSubmit = async (data: MilestoneFormData) => {
    try {
      if (isEditing && currentRow) {
        await updateMilestoneMutation.mutateAsync({
          id: currentRow.id,
          data: {
            ...data,
            applyFor: data.applyFor || []
          }
        })
        toast.success('Milestone updated successfully!')
      } else {
        await createMilestoneMutation.mutateAsync({
          ...data,
          applyFor: data.applyFor || []
        })
        toast.success('Milestone created successfully!')
      }
      form.reset()
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error submitting form:', error)

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred while submitting the form'
      toast.error(errorMessage)
    }
  }

  const isLoading = createMilestoneMutation.isPending || updateMilestoneMutation.isPending

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
          <DialogTitle>{isEditing ? 'Edit Milestone' : 'Create New Milestone'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update milestone information. Click save to apply changes.'
              : 'Enter information to create a new milestone. Click create to complete.'}
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form id='milestone-form' onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 p-0.5 '>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milestone Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter milestone name' {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='sequenceOrder'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence Order *</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='1'
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          disabled={isLoading}
                          min={1}
                          max={999}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='applyFor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apply For *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        // Convert single selection to array
                        field.onChange([value])
                      }}
                      defaultValue={field.value?.[0] || ''}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select apply for' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {applyForOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter milestone description'
                        className='min-h-[120px]'
                        {...field}
                        disabled={isLoading}
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
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type='submit' form='milestone-form' disabled={isLoading} className='min-w-[100px]'>
            {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save changes' : 'Create milestone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
