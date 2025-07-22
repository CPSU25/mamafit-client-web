import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus, Trash, Edit, X, Clock, User } from 'lucide-react'
import { useCreateTask, useDeleteTask, useMilestone, useUpdateTask } from '@/services/admin/manage-milestone.service'
import { TaskFormData, transformMilestoneTypeToMilestone, Task } from '../data/schema'
import dayjs from 'dayjs'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface ExpandedMilestoneDetailProps {
  milestoneId: string
}

export function ExpandedMilestoneDetail({ milestoneId }: ExpandedMilestoneDetailProps) {
  const [showAddTaskForm, setShowAddTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)

  const { data: milestoneResponse, isLoading, error } = useMilestone(milestoneId)
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const form = useForm<TaskFormData>({
    defaultValues: {
      name: '',
      description: '',
      sequenceOrder: 1
    }
  })

  useEffect(() => {
    form.reset({
      name: '',
      description: '',
      sequenceOrder: 1
    })
    setShowAddTaskForm(false)
    setEditingTask(null)
  }, [milestoneId, form])

  const handleAddTask = useCallback(
    async (data: TaskFormData) => {
      try {
        if (editingTask) {
          // Update existing task
          await updateTaskMutation.mutateAsync({
            id: editingTask,
            data: {
              ...data,
              milestoneId: milestoneId
            }
          })
          toast.success('Cập nhật task thành công!')
        } else {
          // Create new task
          const taskData = {
            ...data,
            milestoneId: milestoneId
          }
          await createTaskMutation.mutateAsync(taskData)
          toast.success('Thêm task thành công!')
        }
        setShowAddTaskForm(false)
        setEditingTask(null)
        form.reset({
          name: '',
          description: '',
          sequenceOrder: 1
        })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
      }
    },
    [createTaskMutation, updateTaskMutation, editingTask, milestoneId, form]
  )

  const handleDeleteTask = useCallback(
    async (taskId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      try {
        await deleteTaskMutation.mutateAsync(taskId)
        toast.success('Xóa task thành công!')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
      }
    },
    [deleteTaskMutation]
  )

  const handleEditTask = useCallback(
    (taskId: string, taskData: { name: string; description: string; sequenceOrder: number }) => {
      setEditingTask(taskId)
      form.reset({
        name: taskData.name,
        description: taskData.description,
        sequenceOrder: taskData.sequenceOrder
      })
      setShowAddTaskForm(true)
    },
    [form]
  )
  const handleToggleAddForm = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setShowAddTaskForm((prev) => {
        if (!prev) {
          // Reset mutations when opening form
          createTaskMutation.reset()
          updateTaskMutation.reset()
          setEditingTask(null)
          form.reset({
            name: '',
            description: '',
            sequenceOrder: 1
          })
        }
        return !prev
      })
    },
    [createTaskMutation, updateTaskMutation, form]
  )
  const handleCancelEdit = useCallback(() => {
    setEditingTask(null)
    setShowAddTaskForm(false)
    form.reset({
      name: '',
      description: '',
      sequenceOrder: 1
    })
  }, [form])

  if (!milestoneId) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center gap-3'>
          <Package className='h-16 w-16 text-muted-foreground' />
          <p className='text-muted-foreground'>Chọn một milestone để xem tasks</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          <span className='ml-2 text-sm text-muted-foreground'>Đang tải chi tiết milestone...</span>
        </div>
      </div>
    )
  }

  if (error || !milestoneResponse?.data) {
    return (
      <div className='p-6'>
        <div className='text-center py-8'>
          <p className='text-sm text-destructive'>Không thể tải chi tiết milestone</p>
          <p className='text-xs text-muted-foreground mt-1'>
            {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
          </p>
        </div>
      </div>
    )
  }

  const milestone = transformMilestoneTypeToMilestone(milestoneResponse.data)
  const tasks = milestone.tasks || []

  return (
    <div className='p-6 bg-muted/20'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold'>Tasks</h3>
          <p className='text-sm text-muted-foreground'>
            Danh sách các task thuộc milestone này ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
          </p>
        </div>

        {/* Tasks Section */}
        <div>
          <Card className='border-0 shadow-md bg-background py-0'>
            <CardHeader className='bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg py-3'>
              <CardTitle className='flex items-center justify-between text-lg'>
                <div className='flex items-center gap-2'>
                  <Package className='h-5 w-5' aria-hidden='true' />
                  Danh Sách Tasks ({tasks.length})
                </div>
                <Button
                  size='sm'
                  onClick={handleToggleAddForm}
                  data-action-button='true'
                  className='bg-background text-primary hover:bg-accent border border-border'
                  disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                >
                  {showAddTaskForm ? (
                    <>
                      <X className='h-4 w-4 mr-2' aria-hidden='true' />
                      Đóng Form
                    </>
                  ) : (
                    <>
                      <Plus className='h-4 w-4 mr-2' aria-hidden='true' />
                      Thêm Task
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className='p-4'>
              {showAddTaskForm && (
                <Card className='mb-4 border-2 border-dashed border-primary/30 bg-primary/5'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-base text-primary flex items-center gap-2'>
                        {editingTask ? <Edit className='h-4 w-4' /> : <Plus className='h-4 w-4' />}
                        {editingTask ? 'Chỉnh sửa Task' : 'Thêm Task Mới'}
                      </CardTitle>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={handleCancelEdit}
                        disabled={createTaskMutation.isPending}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleAddTask)} className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-foreground'>Tên Task *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Nhập tên task'
                                    className='border-border focus:border-primary focus:ring-primary'
                                    disabled={createTaskMutation.isPending}
                                    {...field}
                                  />
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
                                <FormLabel className='text-foreground'>Thứ tự *</FormLabel>
                                <FormControl>
                                  <Input
                                    type='number'
                                    placeholder='1'
                                    min={1}
                                    className='border-border focus:border-primary focus:ring-primary'
                                    disabled={createTaskMutation.isPending}
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name='description'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-foreground'>Mô tả *</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='Mô tả về task...'
                                  rows={3}
                                  className='border-border focus:border-primary focus:ring-primary'
                                  disabled={createTaskMutation.isPending}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='flex gap-2'>
                          <Button
                            type='submit'
                            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                            className='bg-primary hover:bg-primary/90 text-primary-foreground'
                          >
                            {createTaskMutation.isPending || updateTaskMutation.isPending ? (
                              <>
                                <Loader2 className='animate-spin h-4 w-4 mr-2' />
                                {editingTask ? 'Đang cập nhật...' : 'Đang tạo...'}
                              </>
                            ) : (
                              <>
                                {editingTask ? <Edit className='h-4 w-4 mr-2' /> : <Plus className='h-4 w-4 mr-2' />}
                                {editingTask ? 'Cập nhật Task' : 'Tạo Task'}
                              </>
                            )}
                          </Button>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancelEdit}
                            disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                            className='border-border hover:bg-muted'
                          >
                            Hủy
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
              {createTaskMutation.error || updateTaskMutation.error ? (
                <div className='mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm'>
                  {createTaskMutation.error instanceof Error
                    ? createTaskMutation.error.message
                    : updateTaskMutation.error instanceof Error
                      ? updateTaskMutation.error.message
                      : 'Có lỗi xảy ra khi xử lý task'}
                </div>
              ) : null}

              {tasks.length === 0 ? (
                <div className='text-center py-8'>
                  <Package className='h-12 w-12 mx-auto mb-3 text-muted-foreground' aria-hidden='true' />
                  <h4 className='text-base font-medium text-foreground mb-1'>Chưa có task nào</h4>
                  <p className='text-muted-foreground text-sm'>
                    Milestone này chưa có task nào. Hãy thêm task đầu tiên để bắt đầu quản lý công việc.
                  </p>
                </div>
              ) : (
                <div className='grid gap-3'>
                  {tasks.map((task: Task) => (
                    <Card key={task.id} className='hover:shadow-sm transition-shadow group'>
                      <CardHeader className='pb-3'>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='text-base font-medium flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs font-mono'>
                              #{task.sequenceOrder}
                            </Badge>
                            {task.name}
                          </CardTitle>
                          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => handleEditTask(task.id, task)}
                              disabled={
                                createTaskMutation.isPending ||
                                updateTaskMutation.isPending ||
                                deleteTaskMutation.isPending
                              }
                              className='h-8 w-8 p-0 text-muted-foreground hover:text-primary'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={(e) => handleDeleteTask(task.id, e)}
                              disabled={
                                createTaskMutation.isPending ||
                                updateTaskMutation.isPending ||
                                deleteTaskMutation.isPending
                              }
                              className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                            >
                              <Trash className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                        {task.description && <CardDescription className='mt-2'>{task.description}</CardDescription>}
                      </CardHeader>
                      <CardContent className='pt-0'>
                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Clock className='h-3 w-3' />
                            {dayjs(task.createdAt).format('DD/MM/YYYY')}
                          </span>
                          <span className='flex items-center gap-1'>
                            <User className='h-3 w-3' />
                            {task.createdBy}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
