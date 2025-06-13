import { AppLayout, SystemLayout, GuestLayout } from '@/layouts'
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
  StylePage,
  MaternityDressPage
  // InventoryPage
} from '@/pages'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Root route - Customer area (will be implemented later)
      {
        path: '/',
        element: <div>Customer Landing Page - To be implemented</div>
      },

      // System sign-in route - OUTSIDE of /system to avoid guard loop
      {
        path: '/system/sign-in',
        element: <GuestLayout />,
        children: [
          {
            index: true,
            element: <SignInPage />
          }
        ]
      },

      // Admin routes - Direct protected routes without nested /system
      {
        path: '/system/admin',
        element: (
          <AuthMiddleware allowedRoles={['Admin']}>
            <SystemLayout role='Admin' />
          </AuthMiddleware>
        ),
        children: [
          {
            index: true, // Default route for /system/admin
            element: <Navigate to='/system/admin/dashboard' replace />
          },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'category', element: <CategoryPage /> },
          { path: 'style', element: <StylePage /> },
          { path: 'users', element: <div>Users Page</div> },
          { path: 'branches', element: <div>Manage Branches Page</div> },
          { path: 'inventory', element: <MaternityDressPage /> },
          { path: 'transactions', element: <div>Transactions Page</div> },
          { path: 'settings', element: <div>System Settings Page</div> }
        ]
      },

      // Branch Manager routes
      {
        path: '/system/branch',
        element: (
          <AuthMiddleware allowedRoles={['BranchManager']}>
            <SystemLayout role='BranchManager' />
          </AuthMiddleware>
        ),
        children: [
          {
            index: true, // Default route for /system/branch
            element: <Navigate to='/system/branch/dashboard' replace />
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

      // Designer routes
      {
        path: '/system/designer',
        element: (
          <AuthMiddleware allowedRoles={['Designer']}>
            <SystemLayout role='Designer' />
          </AuthMiddleware>
        ),
        children: [
          {
            index: true, // Default route for /system/designer
            element: <Navigate to='/system/designer/dashboard' replace />
          },
          {
            path: 'dashboard',
            element: <DesignerDashboard />
          }
        ]
      },

      // Factory Manager routes
      {
        path: '/system/factory-manager',
        element: (
          <AuthMiddleware allowedRoles={['Manager']}>
            <SystemLayout role='Manager' />
          </AuthMiddleware>
        ),
        children: [
          {
            index: true, // Default route for /system/factory-manager
            element: <Navigate to='/system/factory-manager/dashboard' replace />
          },
          {
            path: 'dashboard',
            element: <FactoryManagerDashboard />
          }
        ]
      },

      // System base route - redirect to sign-in
      {
        path: '/system',
        element: <Navigate to='/system/sign-in' replace />
      },

      // 404 - Not Found
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
])
