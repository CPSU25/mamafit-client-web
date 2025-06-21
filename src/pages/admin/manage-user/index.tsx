import { useState } from 'react'
import { Main } from '@/components/layout/main'
import { useGetListUser } from '@/services/admin/manage-user.service'
import { transformManageUserToUser } from './data/schema'

import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'

export default function ManageUserPage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10,
    nameSearch: '',
    roleName: ''
  })

  const { data: apiResponse, isLoading, error } = useGetListUser(queryParams)

  // Transform API data to component format
  const userList = apiResponse?.data?.items?.map(transformManageUserToUser) || []

  if (isLoading) {
    return (
      <Main>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load users</p>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <UsersProvider>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>Manage your users and their roles here.</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={userList} columns={columns} />
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
