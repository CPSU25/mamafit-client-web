import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  Palette,
  FolderOpen,
  Factory,
  Package2,
  Award,
  Tags,
  MessagesSquare,
  Building,
  Ticket,
  CalendarDays,
  // FileText,
  // BarChart3,
  Clock,
  Boxes,
  ClipboardList,
  DollarSign,
  // UserCheck,
  Shirt,
  Scissors,
  // PaintBucket,
  Store,
  // Bell,
  Shield,
  PenTool,
  Bell,
  Eye
} from 'lucide-react'
import { SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'MamaFit Admin',
    email: 'admin@mamafit.studio',
    avatar: '/avatars/default.jpg'
  },
  role: [
    {
      name: 'Admin',
      navGroups: [
        {
          title: 'Tổng quan',
          items: [{ title: 'Bảng điều khiển', url: 'dashboard', icon: LayoutDashboard }]
        },
        {
          title: 'Quản lý hệ thống',
          items: [
            { title: 'Quản lý người dùng', url: 'manage-user', icon: Users },
            {
              title: 'Quản lý đơn hàng',
              icon: Package2,
              items: [
                { title: 'Tất cả đơn hàng', url: 'manage-order', icon: Package2 },
                { title: 'Đơn hàng bảo hành', url: 'manage-order/warranty', icon: Shield },
                { title: 'Đơn hàng yêu cầu thiết kế', url: 'manage-order/design-request', icon: PenTool },
                { title: 'Chi tiết đơn hàng', url: 'manage-order/:orderId', icon: Eye, disabled: true }
              ]
            },
            {
              title: 'Quản lý chi nhánh',
              icon: Building,
              items: [{ title: 'Danh sách chi nhánh', url: 'manage-branch', icon: Store }]
            },
            { title: 'Quản lý danh mục', url: 'manage-category', icon: Tags },
            { title: 'Quản lý váy bầu', url: 'manage-maternity-dress', icon: Shirt },
            { title: 'Quản lý thành phần', url: 'manage-component', icon: Boxes },
            { title: 'Quản lý mốc nhiệm vụ', url: 'manage-milestone', icon: Clock },
            { title: 'Yêu cầu bảo hành', url: 'manage-warranty', icon: Shield },

            { title: 'Quản lý khuyến mãi', url: 'manage-voucher', icon: Ticket }
          ]
        },
        {
          title: 'Giao dịch',
          items: [{ title: 'Quản lý thanh toán', url: 'manage-transaction', icon: DollarSign }]
        },
        {
          title: 'Cài đặt',
          items: [
            { title: 'Cấu hình hệ thống', url: 'settings', icon: Settings },
            { title: 'Thông báo hệ thống', url: 'system-notifications', icon: Bell }
          ]
        }
      ]
    },
    {
      name: 'BranchManager',
      navGroups: [
        {
          title: 'Quản lý chi nhánh',
          items: [
            { title: 'Tổng quan chi nhánh', url: 'dashboard', icon: LayoutDashboard }
            // { title: 'Báo cáo chi nhánh', url: 'reports', icon: BarChart3, badge: '3' }
          ]
        },
        {
          title: 'Vận hành',
          items: [
            { title: 'Quản lý lịch hẹn', url: 'manage-appointment', icon: CalendarDays, badge: '12' },
            {
              title: 'Quản lý đơn hàng',
              icon: Package,
              url: 'manage-order'
            },
            { title: 'Chi tiết đơn hàng', url: 'manage-order/:orderId', icon: Eye, disabled: true }
          ]
        },
        {
          title: 'Bảo hành',
          items: [{ title: 'Quản lý bảo hành', url: 'manage-warranty', icon: Shield }]
        },
        {
          title: 'Tương tác',
          items: [
            { title: 'Tin nhắn khách hàng', url: 'messages', icon: MessagesSquare, badge: '8' }
            // { title: 'Check-in/Check-out', url: 'check-in-out', icon: UserCheck }
          ]
        }
      ]
    },
    {
      name: 'Designer',
      navGroups: [
        {
          title: 'Thiết kế',
          items: [
            { title: 'Bảng làm việc', url: 'dashboard', icon: LayoutDashboard }
            // { title: 'Thống kê thiết kế', url: 'design-stats', icon: TrendingUp }
          ]
        },
        {
          title: 'Quản lý thiết kế',
          items: [
            {
              title: 'Mẫu thiết kế',
              icon: Palette,
              items: [
                { title: 'Thư viện mẫu', url: 'manage-template', icon: Shirt }
                // { title: 'Tạo mẫu mới', url: 'manage-template/create', icon: PaintBucket },
                // { title: 'Mẫu nổi bật', url: 'manage-template/featured', icon: Award }
              ]
            },
            { title: 'Yêu cầu thiết kế', url: 'manage-design-request', icon: Award, badge: '7' }
            // { title: 'Công việc của tôi', url: 'manage-task', icon: ClipboardList }
          ]
        },
        {
          title: 'Tương tác',
          items: [
            { title: 'Chat với khách hàng', url: 'messages', icon: MessagesSquare, badge: '4' }
            // { title: 'Phản hồi thiết kế', url: 'design-feedback', icon: FileText }
          ]
        }
      ]
    },
    {
      name: 'Manager',
      navGroups: [
        {
          title: 'Tổng quan',
          items: [
            { title: 'Tổng quan sản xuất', url: 'dashboard', icon: LayoutDashboard }
            // { title: 'Báo cáo sản xuất', url: 'production-reports', icon: BarChart3 }
          ]
        },
        {
          title: 'Vận hành nhà máy',
          items: [
            {
              title: 'Quản lý sản phẩm',
              icon: Factory,
              items: [
                { title: 'Sản phẩm', url: 'manage-production', icon: Scissors },
                { title: 'Quản lý mẫu', url: 'manage-template', icon: Palette }
              ]
            },
            {
              title: 'Quản lý đơn hàng',
              icon: Package,
              url: 'manage-order'
            },
            { title: 'Yêu cầu thiết kế', url: 'manage-order/design-request', icon: PenTool }
          ]
        },
        {
          title: 'Bảo hành',
          items: [
            { title: 'Yêu cầu bảo hành', url: 'manage-warranty', icon: Shield },
            { title: 'Đơn hàng bảo hành', url: 'manage-order/warranty', icon: Shield }
          ]
        },
        {
          title: 'Quản lý nhiệm vụ',
          items: [{ title: 'Quản lý mốc nhiệm vụ', url: 'manage-task', icon: FolderOpen }]
        },
        {
          title: 'Cài đặt',
          items: [{ title: 'Thông báo hệ thống', url: 'system-notifications', icon: Bell }]
        }
      ]
    },
    {
      name: 'Staff',
      navGroups: [
        {
          title: 'Công việc',
          items: [
            { title: 'Bảng công việc', url: 'dashboard', icon: LayoutDashboard },
            { title: 'Nhiệm vụ của tôi', url: 'manage-task', icon: ClipboardList, badge: '5' }
          ]
        },
        {
          title: 'Cài đặt',
          items: [{ title: 'Thông báo hệ thống', url: 'system-notifications', icon: Bell }]
        }
      ]
    }
  ]
}
