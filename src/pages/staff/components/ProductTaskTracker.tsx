import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductTaskGroup, TaskStatus } from '@/pages/staff/tasks/types'
import { MilestoneItem } from './MilestoneItem'

interface ProductTaskTrackerProps {
  productGroups: ProductTaskGroup[]
  onTaskStatusChange: (taskId: string, status: TaskStatus, orderItemId?: string) => void
  isUpdating?: boolean
}

export const ProductTaskTracker: React.FC<ProductTaskTrackerProps> = ({
  productGroups,
  onTaskStatusChange,
  isUpdating = false
}) => {
  if (!productGroups || productGroups.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>Chưa có công việc nào được giao.</p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {productGroups.map((productGroup) => {
        const { preset, milestones } = productGroup

        // Tính toán tiến độ tổng thể cho sản phẩm
        const totalTasks = milestones.reduce((sum, milestone) => sum + milestone.maternityDressTasks.length, 0)
        const completedTasks = milestones.reduce(
          (sum, milestone) => sum + milestone.maternityDressTasks.filter((task) => task.status === 'COMPLETED').length,
          0
        )
        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return (
          <Card key={preset.id} className='overflow-hidden'>
            <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 border-b'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-4'>
                  <img
                    src={preset.images[0]}
                    alt={preset.styleName}
                    className='w-16 h-16 rounded-lg object-cover shadow-sm'
                  />
                  <div>
                    <CardTitle className='text-xl'>{preset.styleName}</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      Mã sản phẩm: <span className='font-mono'>{preset.id}</span>
                    </p>
                    <p className='text-lg font-semibold text-primary mt-1'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(preset.price)}
                    </p>
                  </div>
                </div>

                <div className='flex flex-col items-end gap-2'>
                  <Badge variant={overallProgress === 100 ? 'default' : 'secondary'} className='text-sm'>
                    {overallProgress}% hoàn thành
                  </Badge>
                  <p className='text-sm text-muted-foreground'>
                    {completedTasks}/{totalTasks} nhiệm vụ
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-6'>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-foreground mb-4'>
                  Quy trình thực hiện ({milestones.length} giai đoạn)
                </h3>

                {/* Timeline/Stepper cho các milestones */}
                <div className='relative'>
                  {milestones
                    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                    .map((milestone, milestoneIndex) => (
                      <MilestoneItem
                        key={`${preset.id}-${milestone.sequenceOrder}`}
                        milestone={milestone}
                        isLast={milestoneIndex === milestones.length - 1}
                        onTaskStatusChange={onTaskStatusChange}
                        orderItemId={productGroup.orderItemId}
                        isUpdating={isUpdating}
                      />
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
