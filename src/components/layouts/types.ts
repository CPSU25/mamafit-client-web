interface User {
  name: string
  email: string
  avatar: string
}
interface Role {
  name: string
  navGroups: NavGroup[]
}
interface Team {
  name: string
  logo: React.ElementType
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

type NavLink = BaseNavItem & {
  url: string
  items?: never
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
  teams: Team[]
}

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink }
