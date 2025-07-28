import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { useComponents as useComponentsAPI } from '@/services/admin/manage-component.service'
import { transformComponentListToComponent } from './data/schema'

import { columns } from './components/components-columns'
import { ComponentsDialogs } from './components/components-dialogs'
import { ComponentsPrimaryButtons } from './components/components-primary-buttons'
import { ComponentsTable } from './components/components-table'
import ComponentsProvider from './context/components-context'

export default function ManageComponentPage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10
  })

  const { data: apiResponse, isLoading, error } = useComponentsAPI(queryParams)

  // Transform API data to component format
  const componentList = apiResponse?.data?.items?.map(transformComponentListToComponent) || []

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading components...</p>
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
            <p className='text-destructive mb-2'>Cannot load components</p>
            <p className='text-muted-foreground text-sm'>{errorMessage}</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <ComponentsProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Manage Components</h2>
            <p className='text-muted-foreground'>Manage components and their options</p>
          </div>
          <ComponentsPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <ComponentsTable data={componentList} columns={columns} />
        </div>
      </Main>

      <ComponentsDialogs />
    </ComponentsProvider>
  )
}
