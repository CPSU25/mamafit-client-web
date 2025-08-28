import { AppLayout, SystemLayout, GuestLayout, AuthGuard } from '@/layouts'
import {
  AdminDashboardPage,
  ManageBranchPage,
  ManageCategoryPage,
  ManageComponentPage,
  ManageMaternityDressPage,
  ManageMilestonePage,
  ManageOrderPage,
  ManageUserPage,
  ManageVoucherPage,
  WarrantyManagementSystem,
  OrderDetailPage,
  SystemConfigPage,
  ManageTransactionPage
} from '@/pages/admin'
// Import các trang manage order mới
import WarrantyOrderPage from '@/pages/admin/manage-order/warranty'
import DesignRequestPage from '@/pages/admin/manage-order/design-request'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { NotFoundPage, LoginSystem, ChatPage, NotificationSettingPage } from '@/pages/public-page'
// import { FactoryManagerDashboard } from '@/pages/factory-manager'
import { DesignerDashboard, ManageTemplatePage, ManageDesignRequestPage } from '@/pages/designer'
import {
  BranchDashboard,
  CashierPage,
  ManageAppointmentPage,
  ManageBranchOrderPage,
  ManageBranchWarrantyPage
} from '@/pages/branch'
import { OrderItemDetailPage, StaffTasksPage } from '@/pages/staff'
import StaffDashboardPage from '@/pages/staff/dashboard'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Root route - redirect to system
      {
        path: '/',
        element: <Navigate to='/system' replace />
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

      // Admin routes - Simplified with AuthGuard
      {
        path: '/system/admin',
        element: (
          <AuthGuard requiredRole='Admin'>
            <SystemLayout role='Admin' />
          </AuthGuard>
        ),
        children: [
          { path: 'dashboard', element: <AdminDashboardPage /> },
          { path: 'manage-category', element: <ManageCategoryPage /> },
          { path: 'manage-user', element: <ManageUserPage /> },
          { path: 'manage-branch', element: <ManageBranchPage /> },
          { path: 'manage-maternity-dress', element: <ManageMaternityDressPage /> },
          { path: 'manage-component', element: <ManageComponentPage /> },
          { path: 'manage-milestone', element: <ManageMilestonePage /> },
          { path: 'manage-order', element: <ManageOrderPage /> },
          { path: 'manage-order/design-request', element: <DesignRequestPage /> },
          { path: 'manage-order/warranty', element: <WarrantyOrderPage /> },
          { path: 'manage-order/:orderId', element: <OrderDetailPage /> },
          { path: 'manage-voucher', element: <ManageVoucherPage /> },
          { path: 'manage-transaction', element: <ManageTransactionPage /> },
          { path: 'manage-warranty', element: <WarrantyManagementSystem /> },
          { path: 'system-notifications', element: <NotificationSettingPage /> },
          { path: 'settings', element: <SystemConfigPage /> }
        ]
      },

      // Branch Manager routes
      {
        path: '/system/branch',
        element: (
          <AuthGuard requiredRole='BranchManager'>
            <SystemLayout role='BranchManager' />
          </AuthGuard>
        ),
        children: [
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
          },
          {
            path: 'manage-appointment',
            element: <ManageAppointmentPage />
          },
          {
            path: 'manage-order',
            element: <ManageBranchOrderPage />
          },
          { path: 'manage-branch-order/:orderId', element: <OrderDetailPage /> },
          {
            path: 'manage-warranty',
            element: <ManageBranchWarrantyPage />
          }
        ]
      },

      // Designer routes
      {
        path: '/system/designer',
        element: (
          <AuthGuard requiredRole='Designer'>
            <SystemLayout role='Designer' />
          </AuthGuard>
        ),
        children: [
          {
            path: 'messages',
            element: <ChatPage />
          },
          {
            path: 'dashboard',
            element: <DesignerDashboard />
          },
          {
            path: 'manage-template',
            element: <ManageTemplatePage />
          },
          // {
          //   path: 'manage-task',
          //   element: <StaffTasksPage />
          // },
          {
            path: 'manage-design-request',
            element: <ManageDesignRequestPage />
          }
          // {
          //   path: 'order-item/:orderItemId',
          //   element: <OrderItemDetailPage />
          // }
        ]
      },

      // Factory Manager routes
      {
        path: '/system/manager',
        element: (
          <AuthGuard requiredRole='Manager'>
            <SystemLayout role='Manager' />
          </AuthGuard>
        ),
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboardPage />
          },
          {
            path: 'manage-production',
            element: <ManageMaternityDressPage />
          },
          {
            path: 'manage-template',
            element: <ManageTemplatePage />
          },
          {
            path: 'manage-design-request',
            element: <div>Manage Design Requests Page</div>
          },
          {
            path: 'manage-order',
            element: <ManageOrderPage />
          },
          { path: 'manage-order/design-request', element: <DesignRequestPage /> },
          { path: 'manage-order/warranty', element: <WarrantyOrderPage /> },
          { path: 'manage-order/:orderId', element: <OrderDetailPage /> },
          {
            path: 'manage-task',
            element: <ManageMilestonePage />
          },
          { path: 'system-notifications', element: <NotificationSettingPage /> },
          {
            path: 'manage-warranty',
            element: <WarrantyManagementSystem />
          }
        ]
      },

      // Factory Staff routes
      {
        path: '/system/staff',
        element: (
          <AuthGuard requiredRole='Staff'>
            <SystemLayout role='Staff' />
          </AuthGuard>
        ),
        children: [
          { path: 'dashboard', element: <StaffDashboardPage /> },
          {
            path: 'manage-task',
            element: <StaffTasksPage />
          },
          {
            path: 'order-item/:orderItemId',
            element: <OrderItemDetailPage />
          },
          { path: 'system-notifications', element: <NotificationSettingPage /> }
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
