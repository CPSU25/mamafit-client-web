import { AppLayout, DefaultLayout, GuestLayout } from '@/layouts'
import { RoleLayout } from '@/layouts/role-layout'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import { NotFoundPage, SignInPage } from '@/pages'
// import { AdminHome } from '@/pages/admin'
import AdminDashboard from '@/pages/admin/dashboard.page'
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Catch all routes that are not defined in the app
      {
        path: '/*',
        element: <NotFoundPage />
      },
      // Non-authenticated routes
      {
        element: <GuestLayout />,
        children: [
          {
            path: '/sign-in',
            element: <SignInPage />
          }
        ]
      },
      // Authenticated routes

      {
        element: <DefaultLayout />,
        children: [
          {
            path: 'admin',
            element: (
              <AuthMiddleware allowedRoles={['admin']}>
                <RoleLayout role='admin' />
              </AuthMiddleware>
            ),
            children: [
              { path: 'dashboard', element: <AdminDashboard /> },
              // { path: 'users', element: <AdminUsers /> },
              // { path: 'settings', element: <AdminSettings /> }
            ]
          }
        ]
      }
    ]
  }
])
