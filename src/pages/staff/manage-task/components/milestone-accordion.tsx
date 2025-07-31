import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { StaffTaskUI, TaskStatus as UITaskStatus } from '@/pages/staff/manage-task/tasks/types'
import { TaskItem } from './task-item'

interface MilestoneAccordionProps {
  tasks: StaffTaskUI[]
  onTaskStatusChange: (taskId: string, status: UITaskStatus) => void
}

export const MilestoneAccordion: React.FC<MilestoneAccordionProps> = ({ tasks, onTaskStatusChange }) => {
  const sortedMilestones = [...tasks].sort((a, b) => a.milestones.sequenceOrder - b.milestones.sequenceOrder)

  return (
    <Accordion type='single' collapsible className='w-full' defaultValue={`item-${sortedMilestones[0]?.id}`}>
      {sortedMilestones.map((task) => {
        const milestone = task.milestones
        const totalTasks = milestone.maternityDressTasks.length
        const completedTasks = milestone.maternityDressTasks.filter((t) => t.status === 'DONE').length
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

        const sortedInnerTasks = [...milestone.maternityDressTasks].sort((a, b) => a.sequenceOrder - b.sequenceOrder)

        return (
          <AccordionItem value={`item-${task.id}`} key={task.id}>
            <AccordionTrigger>
              <div className='flex flex-col items-start text-left w-full pr-4'>
                <span className='text-lg font-semibold'>{milestone.name}</span>
                <div className='flex items-center w-full mt-2'>
                  <Progress value={progress} className='w-full h-2 mr-4' />
                  <span className='text-sm text-muted-foreground whitespace-nowrap'>
                    {completedTasks} / {totalTasks}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className='pt-4'>
              {sortedInnerTasks.map((innerTask) => (
                <TaskItem key={innerTask.id} task={innerTask} onStatusChange={onTaskStatusChange} />
              ))}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
