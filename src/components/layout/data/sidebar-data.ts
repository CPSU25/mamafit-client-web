import {
  LayoutDashboard,
  User,
  Users,
  Settings,
  ShoppingCart,
  Package,
  Palette,
  FolderOpen,
  Factory,
  Package2,
  Award,
  Tags,
  Shirt
} from 'lucide-react'

import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg'
  },
  role: [
    {
      name: 'Admin',
      navGroups: [
        {
          title: 'Admin',
          items: [
            {
              title: 'Dashboard',
              url: '/admin/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Categories',
              url: '/admin/category',
              icon: Tags
            },
            {
              title: 'Styles',
              url: '/admin/style',
              icon: Shirt
            },
            {
              title: 'Users',
              url: '/admin/users',
              icon: Users
            },
            {
              title: 'Manage Branches',
              url: '/admin/branches',
              icon: Users
            },
            {
              title: 'Inventory',
              url: '/admin/inventory',
              icon: Package2
            },
            {
              title: 'Transactions',
              url: '/admin/transactions',
              icon: ShoppingCart
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'System Settings',
              url: '/admin/settings',
              icon: Settings
            }
          ]
        }
      ]
    },
    {
      name: 'BranchManager',
      navGroups: [
        {
          title: 'Branch Management',
          items: [
            {
              title: 'Dashboard',
              url: '/branch/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Cashier',
              url: '/branch/cashier',
              icon: ShoppingCart
            },
            {
              title: 'Orders',
              url: '/branch/orders',
              icon: Package
            },
            {
              title: 'Inventory',
              url: '/branch/inventory',
              icon: Package2
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: '/branch/profile',
              icon: User
            }
          ]
        }
      ]
    },
    {
      name: 'Designer',
      navGroups: [
        {
          title: 'Design',
          items: [
            {
              title: 'Dashboard',
              url: '/designer/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Designs',
              url: '/designer/designs',
              icon: Palette
            },
            {
              title: 'Projects',
              url: '/designer/projects',
              icon: FolderOpen
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: '/designer/profile',
              icon: User
            }
          ]
        }
      ]
    },
    {
      name: 'Manager',
      navGroups: [
        {
          title: 'Factory Management',
          items: [
            {
              title: 'Dashboard',
              url: '/factory-manager/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Production',
              url: '/factory/production',
              icon: Factory
            },
            {
              title: 'Materials',
              url: '/factory/materials',
              icon: Package
            },
            {
              title: 'Quality',
              url: '/factory/quality',
              icon: Award
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: '/factory/profile',
              icon: User
            }
          ]
        }
      ]
    },
    {
      name: 'Staff',
      navGroups: [
        {
          title: 'Cashier',
          items: [
            {
              title: 'Dashboard',
              url: '/cashier/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Orders',
              url: '/cashier/orders',
              icon: Package
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: '/factory/profile',
              icon: User
            }
          ]
        }
      ]
    },
    {
      name: 'BranchStaff',
      navGroups: [
        {
          title: 'Branch Staff',
          items: [
            {
              title: 'Dashboard',
              url: '/branch-staff/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Orders',
              url: '/branch-staff/orders',
              icon: Package
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: '/branch-staff/profile',
              icon: User
            }
          ]
        }
      ]
    }
  ]
}
