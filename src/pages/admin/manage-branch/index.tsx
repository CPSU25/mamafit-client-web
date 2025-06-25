import { useState } from 'react'
import BranchProvider from './context/branch-context'
import { BranchPrimaryButtons } from './components/branch-primary-buttons'
import { BranchDialogs } from './components/branch-dialogs'
import { BranchTable } from './components/branch-tables'
import { columns } from './components/branch-columns'
import { Branch, transformManageBranchTypeToBranch } from './data/schema'
import { useGetBranches } from '@/services/admin/manage-branch.service'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function ManageBranchPage() {
  const [queryParams] = useState({
    index: 1,
    pageSize: 10,
    search: '',
    sortBy: ''
  })

  const { data: branchesResponse, isLoading, isError, error } = useGetBranches(queryParams)

  const branches: Branch[] = branchesResponse?.data?.items?.map(transformManageBranchTypeToBranch) || []

  if (isLoading) {
    return (
      <BranchProvider>
        <div className='container mx-auto py-6'>
          <div className='flex flex-col gap-y-6'>
            <div className='flex flex-col gap-y-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>Branch Management</h1>
                  <p className='text-muted-foreground'>Manage your branches and their information.</p>
                </div>
                <BranchPrimaryButtons />
              </div>
            </div>

            <div className='space-y-4'>
              <Skeleton className='h-8 w-full' />
              <Skeleton className='h-64 w-full' />
              <Skeleton className='h-8 w-full' />
            </div>
          </div>
        </div>
      </BranchProvider>
    )
  }

  if (isError) {
    return (
      <BranchProvider>
        <div className='container mx-auto py-6'>
          <div className='flex flex-col gap-y-6'>
            <div className='flex flex-col gap-y-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <h1 className='text-2xl font-bold tracking-tight'>Branch Management</h1>
                  <p className='text-muted-foreground'>Manage your branches and their information.</p>
                </div>
                <BranchPrimaryButtons />
              </div>
            </div>

            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>
                {error instanceof Error ? error.message : 'Failed to load branches. Please try again.'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </BranchProvider>
    )
  }

  return (
    <BranchProvider>
      <div className='container mx-auto py-6'>
        <div className='flex flex-col gap-y-6'>
          <div className='flex flex-col gap-y-2'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight'>Branch Management</h1>
                <p className='text-muted-foreground'>Manage your branches and their information.</p>
              </div>
              <BranchPrimaryButtons />
            </div>
          </div>

          <BranchTable columns={columns} data={branches} />
          <BranchDialogs />
        </div>
      </div>
    </BranchProvider>
  )
}
