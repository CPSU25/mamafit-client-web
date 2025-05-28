import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
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
  Award
} from 'lucide-react'

import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI'
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise'
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup'
    }
  ],
  role: [
    {
      name: 'admin',
      navGroups: [
        {
          title: 'General',
          items: [
            {
              title: 'Dashboard',
              url: '/admin/dashboard',
              icon: LayoutDashboard
            },
            {
              title: 'Users',
              url: '/admin/users',
              icon: Users
            },
            {
              title: 'Profile',
              url: '/admin/profile',
              icon: User
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
      name: 'branch_manager',
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
      name: 'designer',
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
      name: 'factory_manager',
      navGroups: [
        {
          title: 'Factory Management',
          items: [
            {
              title: 'Dashboard',
              url: '/factory/dashboard',
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
    }
  ]
  //           {
  //             title: 'Branch Settings',
  //             url: '/branch/settings',
  //             icon: Command,
  //           },
  //         ],
  //       },
  //     ],
  //   }
  // ]
}
// navGroups: [
//     {
//       title: 'General',
//       items: [
//         {
//           title: 'Dashboard',
//           url: '/',
//           icon: IconLayoutDashboard,
//         },
//         {
//           title: 'Tasks',
//           url: '/tasks',
//           icon: IconChecklist,
//         },
//         {
//           title: 'Apps',
//           url: '/apps',
//           icon: IconPackages,
//         },
//         {
//           title: 'Chats',
//           url: '/chats',
//           badge: '3',
//           icon: IconMessages,
//         },
//         {
//           title: 'Users',
//           url: '/users',
//           icon: IconUsers,
//         },
//         {
//           title: 'Secured by Clerk',
//           icon: ClerkLogo,
//           items: [
//             {
//               title: 'Sign In',
//               url: '/clerk/sign-in',
//             },
//             {
//               title: 'Sign Up',
//               url: '/clerk/sign-up',
//             },
//             {
//               title: 'User Management',
//               url: '/clerk/user-management',
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: 'Pages',
//       items: [
//         {
//           title: 'Auth',
//           icon: IconLockAccess,
//           items: [
//             {
//               title: 'Sign In',
//               url: '/sign-in',
//             },
//             {
//               title: 'Sign In (2 Col)',
//               url: '/sign-in-2',
//             },
//             {
//               title: 'Sign Up',
//               url: '/sign-up',
//             },
//             {
//               title: 'Forgot Password',
//               url: '/forgot-password',
//             },
//             {
//               title: 'OTP',
//               url: '/otp',
//             },
//           ],
//         },
//         {
//           title: 'Errors',
//           icon: IconBug,
//           items: [
//             {
//               title: 'Unauthorized',
//               url: '/401',
//               icon: IconLock,
//             },
//             {
//               title: 'Forbidden',
//               url: '/403',
//               icon: IconUserOff,
//             },
//             {
//               title: 'Not Found',
//               url: '/404',
//               icon: IconError404,
//             },
//             {
//               title: 'Internal Server Error',
//               url: '/500',
//               icon: IconServerOff,
//             },
//             {
//               title: 'Maintenance Error',
//               url: '/503',
//               icon: IconBarrierBlock,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       title: 'Other',
//       items: [
//         {
//           title: 'Settings',
//           icon: IconSettings,
//           items: [
//             {
//               title: 'Profile',
//               url: '/settings',
//               icon: IconUserCog,
//             },
//             {
//               title: 'Account',
//               url: '/settings/account',
//               icon: IconTool,
//             },
//             {
//               title: 'Appearance',
//               url: '/settings/appearance',
//               icon: IconPalette,
//             },
//             {
//               title: 'Notifications',
//               url: '/settings/notifications',
//               icon: IconNotification,
//             },
//             {
//               title: 'Display',
//               url: '/settings/display',
//               icon: IconBrowserCheck,
//             },
//           ],
//         },
//         {
//           title: 'Help Center',
//           url: '/help-center',
//           icon: IconHelp,
//         },
//       ],
//     },
//   ],
