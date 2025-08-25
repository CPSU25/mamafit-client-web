import { Plus, CalendarPlus, ShoppingBag, MessageCircle, Package, DollarSignIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils/utils'

interface QuickActionsProps {
  role: string
}

export function QuickActions({ role }: QuickActionsProps) {
  const navigate = useNavigate()
  const { state, setOpenMobile } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const getQuickActions = () => {
    // Logic getQuickActions của bạn được giữ nguyên
    switch (role) {
      case 'Admin':
        return [
          {
            icon: Plus,
            label: 'Thêm người dùng',
            action: () => navigate('manage-user'),
            color: 'text-violet-500'
          },
          { icon: Package, label: 'Đơn hàng', action: () => navigate('manage-order'), color: 'text-blue-500' },
          {
            icon: ShoppingBag,
            label: 'Yêu cầu bảo hành',
            action: () => navigate('manage-warranty'),
            color: 'text-purple-500'
          },
          {
            icon: DollarSignIcon,
            label: 'Giao dịch',
            action: () => navigate('manage-transaction'),
            color: 'text-purple-500'
          }
        ]
      case 'BranchManager':
        return [
          {
            icon: CalendarPlus,
            label: 'Lịch hẹn mới',
            action: () => navigate('manage-appointment'),
            color: 'text-blue-500'
          },
          { icon: Package, label: 'Đơn hàng', action: () => navigate('manage-order'), color: 'text-green-500' }
        ]
      case 'Designer':
        return [
          {
            icon: Package,
            label: 'Yêu cầu thiết kế mới',
            action: () => navigate('manage-design-request'),
            color: 'text-purple-500'
          },
          { icon: MessageCircle, label: 'Tin nhắn', action: () => navigate('messages'), color: 'text-blue-500' }
        ]
      case 'Manager':
        return [
          {
            icon: Package,
            label: 'Đơn Hàng Sản Xuất',
            action: () => navigate('manage-order'),
            color: 'text-green-500'
          },
          { icon: Plus, label: 'Tạo task', action: () => navigate('manage-task'), color: 'text-orange-500' }
        ]
      default:
        return []
    }
  }

  const actions = getQuickActions()

  if (actions.length === 0) return null

  // --- Giao diện được thiết kế lại hoàn toàn để nhất quán ---
  return (
    <SidebarGroup>
      {!isCollapsed && (
        <SidebarGroupLabel className='text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider'>
          Thao tác nhanh
        </SidebarGroupLabel>
      )}

      <SidebarMenu className={cn(!isCollapsed && 'mt-2')}>
        {actions.slice(0, 4).map((action, index) => {
          const Icon = action.icon
          return (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton
                onClick={() => {
                  action.action()
                  setOpenMobile(false)
                }}
                tooltip={action.label}
                className={cn(
                  'group relative transition-all duration-300',
                  'hover:bg-violet-50 dark:hover:bg-violet-950/30'
                )}
              >
                <Icon className={cn('transition-all duration-300 group-hover:scale-105', action.color)} />
                <span className='flex-1'>{action.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
