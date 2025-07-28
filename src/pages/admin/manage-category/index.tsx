import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { useCategories as useCategoriesAPI } from '@/services/admin/category.service'
import { transformCategoryTypeToCategory } from './data/schema'

import { columns } from './components/categories-columns'
import { CategoriesDialogs } from './components/categories-dialogs'
import { CategoriesPrimaryButtons } from './components/categories-primary-buttons'
import { CategoriesTable } from './components/categories-table'
import CategoriesProvider from './context/categories-context'

export default function ManageCategoryPage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10
  })

  const { data: apiResponse, isLoading, error } = useCategoriesAPI(queryParams)

  // Transform API data to component format
  const categoryList = apiResponse?.data?.items?.map(transformCategoryTypeToCategory) || []

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-muted-foreground'>Loading categories...</p>
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
            <p className='text-destructive mb-2'>Cannot load categories</p>
            <p className='text-muted-foreground text-sm'>{errorMessage}</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <CategoriesProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Manage Categories</h2>
            <p className='text-muted-foreground'>Manage categories of products</p>
          </div>
          <CategoriesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <CategoriesTable data={categoryList} columns={columns} />
        </div>
      </Main>

      <CategoriesDialogs />
    </CategoriesProvider>
  )
}
