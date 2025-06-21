import { AppLayout, SystemLayout, GuestLayout } from '@/layouts'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import { AdminDashboardPage, ManageCategoryPage, ManageMaternityDressPage, ManageUserPage } from '@/pages/admin'
import { HomePage } from '@/pages/guest'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { NotFoundPage, LoginSystem, ChatPage } from '@/pages/public-page'
import { FactoryManagerDashboard } from '@/pages/factory-manager'
import { DesignerDashboard } from '@/pages/designer'
import { BranchDashboard, CashierPage } from '@/pages/branch'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Root route - Customer area (will be implemented later)
      {
        path: '/',
        element: <HomePage />
      },

      // System sign-in route - OUTSIDE of /system to avoid guard loop
      {
        path: '/system/sign-in',
        element: <GuestLayout />,
        children: [
          {
            index: true,
            element: <LoginSystem />
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
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'manage-category', element: <ManageCategoryPage /> },
          { path: 'manage-user', element: <ManageUserPage /> },
          { path: 'manage-branch', element: <div>Manage Branches Page</div> },
          { path: 'manage-maternity-dress', element: <ManageMaternityDressPage /> },
          { path: 'manage-transaction', element: <div>Transactions Page</div> },
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
            path: 'messages',
            element: <ChatPage />
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
            path: 'messages',
            element: <ChatPage />
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
          },
          {
            path: 'manage-production',
            element: <div>Manage Production Page</div>
          },
          {
            path: 'manage-template',
            element: <div>Manage Templates Page</div>
          },
          {
            path: 'manage-design-request',
            element: <div>Manage Design Requests Page</div>
          },
          {
            path: 'manage-order',
            element: <div>Manage Orders Page</div>
          },
          {
            path: 'manage-task',
            element: <div>Manage Tasks Page</div>
          }
        ]
      },

      // Factory Staff routes

      {
        path: '/system/factory-staff',
        element: (
          <AuthMiddleware allowedRoles={['Staff']}>
            <SystemLayout role='Staff' />
          </AuthMiddleware>
        ),
        children: [
          {
            index: true, // Default route for /system/factory-staff
            element: <Navigate to='/system/factory-staff/dashboard' replace />
          },
          {
            path: 'dashboard',
            element: <div>Dashboard Page</div>
          },
          {
            path: 'manage-task',
            element: <div>Manage Tasks Page</div>
          },
          
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
