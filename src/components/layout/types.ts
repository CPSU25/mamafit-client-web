interface User {
  name: string
  email: string
  avatar: string
}
interface Role {
  name: string
  navGroups: NavGroup[]
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: string
  items?: NavItem[]
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  user: User
  role: Role[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
