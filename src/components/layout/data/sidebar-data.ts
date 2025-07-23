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
  MessagesSquare,
  Building
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
              title: 'Manage Categories',
              url: 'manage-category',
              icon: Tags
            },
            {
              title: 'Manage Users',
              url: 'manage-user',
              icon: Users
            },
            {
              title: 'Manage Branches',
              url: 'manage-branch',
              icon: Building
            },
            {
              title: 'Manage Maternity Dresses',
              url: 'manage-maternity-dress',
              icon: Package2
            },
            {
              title: 'Manage Components',
              url: 'manage-component',
              icon: Package
            },
            {
              title: 'Manage Milestones',
              url: 'manage-milestone',
              icon: FolderOpen
            },
            {
              title: 'Manage Orders',
              url: 'manage-order',
              icon: Package
            },
            {
              title: 'Manage Transactions',
              url: 'manage-transaction',
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
              title: 'Manage Orders',
              url: 'manage-order',
              icon: Package
            },
            {
              title: 'Chats',
              url: 'messages',
              icon: MessagesSquare
            },
            {
              title: 'Manage Inventory',
              url: 'manage-inventory',
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
              title: 'Manage Templates',
              url: 'manage-template',
              icon: Palette
            },
            {
              title: 'Messages',
              url: 'messages',
              icon: MessagesSquare
            },
            {
              title: 'Manage Tasks',
              url: 'manage-task',
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
              title: 'Manage Production',
              url: 'manage-production',
              icon: Factory
            },
            {
              title: 'Manage Templates',
              url: 'manage-template',
              icon: Package
            },
            {
              title: 'Manage Design Requests',
              url: 'manage-design-request',
              icon: Award
            },
            {
              title: 'Manage Orders',
              url: 'manage-order',
              icon: Package
            },
            {
              title: 'Manage Tasks',
              url: 'manage-task',
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
      name: 'Staff',
      navGroups: [
        {
          title: 'Staff',
          items: [
            {
              title: 'Dashboard',
              url: 'dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Manage Tasks',
              url: 'manage-task',
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
    }
  ]
}
