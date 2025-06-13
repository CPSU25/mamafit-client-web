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
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Categories',
              url: 'category',
              icon: Tags
            },
            {
              title: 'Styles',
              url: 'style',
              icon: Shirt
            },
            {
              title: 'Users',
              url: 'users',
              icon: Users
            },
            {
              title: 'Manage Branches',
              url: 'branches',
              icon: Users
            },
            {
              title: 'Inventory',
              url: 'inventory',
              icon: Package2
            },
            {
              title: 'Transactions',
              url: 'transactions',
              icon: ShoppingCart
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'System Settings',
              url: 'settings',
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
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Cashier',
              url: 'cashier',
              icon: ShoppingCart
            },
            {
              title: 'Orders',
              url: 'orders',
              icon: Package
            },
            {
              title: 'Inventory',
              url: 'inventory',
              icon: Package2
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: 'profile',
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
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Designs',
              url: 'designs',
              icon: Palette
            },
            {
              title: 'Projects',
              url: 'projects',
              icon: FolderOpen
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: 'profile',
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
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Production',
              url: 'production',
              icon: Factory
            },
            {
              title: 'Materials',
              url: 'materials',
              icon: Package
            },
            {
              title: 'Quality',
              url: 'quality',
              icon: Award
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: 'profile',
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
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Orders',
              url: 'orders',
              icon: Package
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: 'profile',
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
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Orders',
              url: 'orders',
              icon: Package
            }
          ]
        },
        {
          title: 'Settings',
          items: [
            {
              title: 'Profile',
              url: 'profile',
              icon: User
            }
          ]
        }
      ]
    }
  ]
}
