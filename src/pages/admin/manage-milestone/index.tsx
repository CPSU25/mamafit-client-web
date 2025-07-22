import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { useMilestones as useMilestonesAPI } from '@/services/admin/manage-milestone.service'
import { transformMilestoneListToMilestone } from './data/schema'

import { columns } from './components/milestone-columns'
import { MilestoneDialogs } from './components/milestone-dialogs'
import { MilestonePrimaryButtons } from './components/milestone-primary-buttons'
import { MilestoneTable } from './components/milestone-table'
import MilestonesProvider from './context/milestones-context'

export default function ManageMilestonePage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10,
    sortBy: 'CREATED_AT_DESC'
  })

  const { data: apiResponse, isLoading, error } = useMilestonesAPI(queryParams)

  // Transform API data to milestone format
  const milestoneList = apiResponse?.data?.items?.map(transformMilestoneListToMilestone) || []

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading milestones...</p>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'
    return (
      <Main>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <p className='text-destructive mb-2'>Cannot load milestones</p>
            <p className='text-muted-foreground text-sm'>{errorMessage}</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <MilestonesProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Manage Milestones</h2>
            <p className='text-muted-foreground'>Manage milestones and their tasks</p>
          </div>
          <MilestonePrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <MilestoneTable data={milestoneList} columns={columns} />
        </div>
      </Main>

      <MilestoneDialogs />
    </MilestonesProvider>
  )
}
