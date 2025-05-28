import { AppLayout, DefaultLayout, GuestLayout } from '@/layouts'
import { RoleLayout } from '@/layouts'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import { NotFoundPage, SignInPage, AdminDashboard, BranchDashboard, CashierPage } from '@/pages'
// import { AdminHome } from '@/pages/admin'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <SignInPage />
      },
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
              {
                index: true, // Default route for /admin
                element: <Navigate to='/admin/dashboard' replace />
              },
              { path: 'dashboard', element: <AdminDashboard /> },
              { path: 'users', element: <div>Users Page</div> }
            ]
          },
          {
            path: 'branch',
            element: (
              <AuthMiddleware allowedRoles={['branch_manager']}>
                <RoleLayout role='branch_manager' />
              </AuthMiddleware>
            ),
            children: [
              {
                index: true, // Default route for /branch
                element: <Navigate to='/branch/dashboard' replace />
              },
              {
                path: 'dashboard',
                element: <BranchDashboard />
              },
              {
                path: 'cashier',
                element: <CashierPage />
              }
            ]
          }
        ]
      }
    ]
  }
])
