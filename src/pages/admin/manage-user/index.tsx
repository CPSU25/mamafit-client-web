import { useMemo, useState } from 'react'
import { Main } from '@/components/layout/main'
import { useGetListUser } from '@/services/admin/manage-user.service'
import { transformManageUserToUser } from './data/schema'

import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import { Users, UserCheck, Shield, User, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ManageUserPage() {
  const [queryParams] = useState({
    index: 0,
    pageSize: 10,
    nameSearch: '',
    roleName: ''
  })

  const { data: apiResponse, isLoading, error } = useGetListUser(queryParams)

  // Transform API data to component format
  const userList = useMemo(() => apiResponse?.data?.items?.map(transformManageUserToUser) || [], [apiResponse])

  // Stats
  const totalUsers = userList.length
  const activeUsers = userList.filter((u) => u.isVerify).length
  const utilizationRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

  // Split lists for tabs
  const customerUsers = useMemo(() => userList.filter((u) => u.roleName?.toLowerCase() === 'user'), [userList])
  const systemUsers = useMemo(
    () =>
      userList.filter((u) =>
        ['admin', 'designer', 'staff', 'manager', 'branchmanager'].includes(u.roleName?.toLowerCase())
      ),
    [userList]
  )

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center space-y-4'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
              <Users className='h-8 w-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div>
              <p className='text-lg font-medium text-foreground'>Đang tải người dùng...</p>
              <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
            <CardContent className='pt-6'>
              <div className='text-center space-y-4'>
                <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                  <Users className='h-8 w-8 text-destructive' />
                </div>
                <div>
                  <p className='text-lg font-semibold text-destructive'>Không thể tải người dùng</p>
                  <p className='text-sm text-muted-foreground mt-2'>{errorMessage}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className='px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors'
                >
                  Thử lại
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  return (
    <UsersProvider>
      <Main className='space-y-6'>
        {/* Header */}
        <div className='space-y-6'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                    Quản Lý Người Dùng
                  </h1>
                  <p className='text-sm text-muted-foreground flex items-center gap-1'>
                    Quản lý tài khoản và phân quyền người dùng trong hệ thống
                    <Sparkles className='h-3 w-3 text-violet-500' />
                  </p>
                </div>
              </div>
            </div>
            <UsersPrimaryButtons />
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng người dùng</p>
                    <p className='text-2xl font-bold text-violet-600 dark:text-violet-400'>{totalUsers}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
                    <Users className='h-6 w-6 text-violet-600 dark:text-violet-400' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng account hệ thống</p>
                    <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{systemUsers.length}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <Shield className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng khách hàng</p>
                    <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{customerUsers.length}</p>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
                    <User className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Đã xác thực</p>
                    <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{activeUsers}</p>
                    <Badge variant='outline' className='text-xs border-green-300 text-green-700 dark:text-green-400'>
                      {utilizationRate}% hoạt động
                    </Badge>
                  </div>
                  <div className='h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <UserCheck className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table with tabs */}
        <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
          <CardContent className='p-0'>
            <div className='p-6 space-y-4'>
              <Tabs defaultValue='customers' className='w-full'>
                <TabsList className='grid w-full max-w-md grid-cols-2 bg-white dark:bg-gray-900 shadow-lg border border-violet-200 dark:border-violet-800 rounded-xl p-1'>
                  <TabsTrigger
                    value='customers'
                    className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg'
                  >
                    Người dùng (Customers)
                  </TabsTrigger>
                  <TabsTrigger
                    value='system'
                    className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg'
                  >
                    Tài khoản hệ thống
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='customers' className='mt-6'>
                  <UsersTable data={customerUsers} columns={columns} />
                </TabsContent>
                <TabsContent value='system' className='mt-6'>
                  <UsersTable data={systemUsers} columns={columns} />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
