import { MessageSquare, Paperclip, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card as UICard, CardContent as UICardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MaternityDressTaskUI, TaskStatus } from '@/pages/staff/tasks/types'
import { cn } from '@/lib/utils/utils'

interface TaskItemProps {
  task: MaternityDressTaskUI
  onStatusChange: (taskId: string, status: TaskStatus) => void
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onStatusChange }) => {
  const isCompleted = task.status === 'COMPLETED'

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (task.status) {
      case 'COMPLETED':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'PENDING':
        return 'outline'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <UICard className={cn('mb-3 transition-all', isCompleted && 'bg-muted/50')}>
      <UICardContent className='p-4 flex items-start gap-4'>
        <Checkbox
          id={`task-${task.id}`}
          checked={isCompleted}
          onCheckedChange={(checked) => onStatusChange(task.id, checked ? 'COMPLETED' : 'IN_PROGRESS')}
          className='mt-1'
        />
        <div className='flex-1'>
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              isCompleted && 'line-through text-muted-foreground'
            )}
          >
            {task.name}
          </label>
          <p className={cn('text-sm text-muted-foreground mt-1', isCompleted && 'line-through')}>{task.description}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant={getStatusVariant()} className='capitalize'>
            {task.status.replace('_', ' ').toLowerCase()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem>
                <MessageSquare className='mr-2 h-4 w-4' />
                <span>Thêm ghi chú</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Paperclip className='mr-2 h-4 w-4' />
                <span>Đính kèm ảnh</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </UICardContent>
    </UICard>
  )
}
