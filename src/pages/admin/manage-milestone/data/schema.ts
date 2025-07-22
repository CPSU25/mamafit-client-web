import { z } from 'zod'
import { MilestoneByIdType, MilestoneType, TaskType } from '@/@types/admin.types'

const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  milestoneId: z.string(),
  sequenceOrder: z.number(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string()
})

export type Task = z.infer<typeof taskSchema>

const milestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  applyFor: z.array(z.string()).optional(),
  sequenceOrder: z.number(),
  tasks: z.array(taskSchema).optional(), // Optional for list view
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  createdBy: z.string()
})

export type Milestone = z.infer<typeof milestoneSchema>

export const milestoneListSchema = z.array(milestoneSchema)

// For list view (MilestoneType without options)
export const transformMilestoneListToMilestone = (apiMilestone: MilestoneType): Milestone => {
  return {
    id: apiMilestone.id,
    name: apiMilestone.name,
    description: apiMilestone.description,
    applyFor: apiMilestone.applyFor,
    sequenceOrder: apiMilestone.sequenceOrder,
    tasks: [], // Empty for list view
    createdAt: apiMilestone.createdAt,
    updatedAt: apiMilestone.updatedAt,
    createdBy: apiMilestone.createdBy
  }
}

// For detail view (MilestoneByIdType with options/tasks)
export const transformMilestoneTypeToMilestone = (apiMilestone: MilestoneByIdType): Milestone => {
  return {
    id: apiMilestone.id,
    name: apiMilestone.name,
    description: apiMilestone.description,
    applyFor: apiMilestone.applyFor || [],
    sequenceOrder: apiMilestone.sequenceOrder,
    tasks: (apiMilestone.tasks || []).map((task: TaskType) => ({
      id: task.id,
      name: task.name,
      description: task.description,
      milestoneId: task.milestoneId,
      sequenceOrder: task.sequenceOrder,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      createdBy: task.createdBy
    })),
    createdAt: apiMilestone.createdAt,
    updatedAt: apiMilestone.updatedAt,
    createdBy: apiMilestone.createdBy
  }
}

// Transform standalone task
export const transformTaskTypeToTask = (apiTask: TaskType): Task => {
  return {
    id: apiTask.id,
    name: apiTask.name,
    description: apiTask.description,
    milestoneId: apiTask.milestoneId,
    sequenceOrder: apiTask.sequenceOrder,
    createdAt: apiTask.createdAt,
    updatedAt: apiTask.updatedAt,
    createdBy: apiTask.createdBy
  }
}

// Form data types (re-export from admin.types.ts for convenience)
export type { MilestoneFormData, TaskFormData } from '@/@types/admin.types'
