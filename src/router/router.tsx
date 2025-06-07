import { AppLayout, AuthenticatedLayout, DefaultLayout, GuardLayout, GuestLayout } from '@/layouts'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import {
  NotFoundPage,
  SignInPage,
  AdminDashboard,
  BranchDashboard,
  CashierPage,
  DesignerDashboard,
  FactoryManagerDashboard,
  CategoryPage,
  StylePage
} from '@/pages'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/*',
        element: <NotFoundPage />
      },
      {
        path: '/',
        element: <GuardLayout />
      },
      {
        element: <GuestLayout />,
        children: [
          {
            path: '/sign-in',
            element: <SignInPage />
          }
        ]
      },

      //Authenticated routes
      {
        element: <DefaultLayout />,
        children: [
          {
            path: 'admin',
            element: (
              <AuthMiddleware allowedRoles={['Admin']}>
                <AuthenticatedLayout role='Admin' />
              </AuthMiddleware>
            ),
            children: [
              {
                index: true, // Default route for /admin
                element: <Navigate to='/admin/dashboard' replace />
              },
              { path: 'dashboard', element: <AdminDashboard /> },
              { path: 'category', element: <CategoryPage /> },
              { path: 'style', element: <StylePage /> },
              { path: 'users', element: <div>Users Page</div> },
              { path: 'branches', element: <div>Manage Branches Page</div> },
              { path: 'inventory', element: <div>Inventory Page</div> },
              { path: 'transactions', element: <div>Transactions Page</div> },
              { path: 'settings', element: <div>System Settings Page</div> }
            ]
          },
          {
            path: 'branch',
            element: (
              <AuthMiddleware allowedRoles={['BranchManager']}>
                <AuthenticatedLayout role='BranchManager' />
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
          },
          {
            path: 'designer',
            element: (
              <AuthMiddleware allowedRoles={['Designer']}>
                <AuthenticatedLayout role='Designer' />
              </AuthMiddleware>
            ),
            children: [
              {
                index: true, // Default route for /designer
                element: <Navigate to='/designer/dashboard' replace />
              },
              {
                path: 'dashboard',
                element: <DesignerDashboard />
              }
            ]
          },
          {
            path: 'factory-manager',
            element: (
              <AuthMiddleware allowedRoles={['Manager']}>
                <AuthenticatedLayout role='Manager' />
              </AuthMiddleware>
            ),
            children: [
              {
                index: true, // Default route for /factory-manager
                element: <Navigate to='/factory-manager/dashboard' replace />
              },
              {
                path: 'dashboard',
                element: <FactoryManagerDashboard />
              }
            ]
          }
        ]
      }
    ]
  }
])
