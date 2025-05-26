// import { createBrowserRouter } from 'react-router-dom';
// import { AuthMiddleware } from '@/middleware/auth.middleware';
// import { RoleLayout } from '@/layouts/role-layout';
// import AppLayout from '@/layouts/app.layout';

// // Admin pages
// import AdminDashboard from '@/pages/admin/dashboard.page';
// import AdminUsers from '@/pages/admin/users.page';
// import AdminSettings from '@/pages/admin/settings.page';

// // Branch Manager pages
// import BranchDashboard from '@/pages/branch/dashboard.page';
// import BranchPOS from '@/pages/branch/pos.page';
// import BranchOrders from '@/pages/branch/orders.page';
// import BranchInventory from '@/pages/branch/inventory.page';

// // Designer pages
// import DesignerDashboard from '@/pages/designer/dashboard.page';
// import DesignerDesigns from '@/pages/designer/designs.page';
// import DesignerProjects from '@/pages/designer/projects.page';

// // Factory Manager pages
// import FactoryDashboard from '@/pages/factory/dashboard.page';
// import FactoryProduction from '@/pages/factory/production.page';
// import FactoryMaterials from '@/pages/factory/materials.page';
// import FactoryQuality from '@/pages/factory/quality.page';

// // Auth pages
// import LoginPage from '@/pages/auth/login.page';

// export const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <AppLayout />,
//     children: [
//       // Admin routes
//       {
//         path: 'admin',
//         element: (
//           <AuthMiddleware allowedRoles={['admin']}>
//             <RoleLayout role="admin" />
//           </AuthMiddleware>
//         ),
//         children: [
//           { path: 'dashboard', element: <AdminDashboard /> },
//           { path: 'users', element: <AdminUsers /> },
//           { path: 'settings', element: <AdminSettings /> },
//         ],
//       },

//       // Branch Manager routes
//       {
//         path: 'branch',
//         element: (
//           <AuthMiddleware allowedRoles={['branch_manager']}>
//             <RoleLayout role="branch_manager" />
//           </AuthMiddleware>
//         ),
//         children: [
//           { path: 'dashboard', element: <BranchDashboard /> },
//           { path: 'pos', element: <BranchPOS /> },
//           { path: 'orders', element: <BranchOrders /> },
//           { path: 'inventory', element: <BranchInventory /> },
//         ],
//       },

//       // Designer routes
//       {
//         path: 'designer',
//         element: (
//           <AuthMiddleware allowedRoles={['designer']}>
//             <RoleLayout role="designer" />
//           </AuthMiddleware>
//         ),
//         children: [
//           { path: 'dashboard', element: <DesignerDashboard /> },
//           { path: 'designs', element: <DesignerDesigns /> },
//           { path: 'projects', element: <DesignerProjects /> },
//         ],
//       },

//       // Factory Manager routes
//       {
//         path: 'factory',
//         element: (
//           <AuthMiddleware allowedRoles={['factory_manager']}>
//             <RoleLayout role="factory_manager" />
//           </AuthMiddleware>
//         ),
//         children: [
//           { path: 'dashboard', element: <FactoryDashboard /> },
//           { path: 'production', element: <FactoryProduction /> },
//           { path: 'materials', element: <FactoryMaterials /> },
//           { path: 'quality', element: <FactoryQuality /> },
//         ],
//       },
//     ],
//   },
//   {
//     path: '/login',
//     element: <LoginPage />,
//   },
// ]); 