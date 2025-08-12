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
  Building,
  Ticket,
  CalendarDays,
  FileText,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Boxes,
  ClipboardList,
  DollarSign,
  UserCheck,
  Shirt,
  Scissors,
  PaintBucket,
  Store,
  Bell,
  Shield
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
          items: [
            { title: 'Bảng điều khiển', url: 'dashboard', icon: LayoutDashboard },
            {
              title: 'Phân tích & Báo cáo',
              icon: BarChart3,
              items: [
                { title: 'Báo cáo doanh thu', url: 'analytics/revenue', icon: TrendingUp },
                { title: 'Báo cáo khách hàng', url: 'analytics/customer', icon: Users },
                { title: 'Báo cáo sản xuất', url: 'analytics/production', icon: Factory }
              ]
            }
          ]
        },
        {
          title: 'Quản lý hệ thống',
          items: [
            { title: 'Quản lý người dùng', url: 'manage-user', icon: Users, badge: '256' },
            {
              title: 'Quản lý chi nhánh',
              icon: Building,
              items: [
                { title: 'Danh sách chi nhánh', url: 'manage-branch', icon: Store },
                { title: 'Phân bổ nhân viên', url: 'manage-branch/staff-allocation', icon: UserCheck }
              ]
            },
            { title: 'Quản lý danh mục', url: 'manage-category', icon: Tags },
            { title: 'Quản lý váy bầu', url: 'manage-maternity-dress', icon: Shirt },
            { title: 'Quản lý thành phần', url: 'manage-component', icon: Boxes },
            { title: 'Quản lý mốc nhiệm vụ', url: 'manage-milestone', icon: Clock },
            { title: 'Quản lý bảo hành', url: 'manage-warranty', icon: Shield }
          ]
        },
        {
          title: 'Quản lý giao dịch',
          items: [
            {
              title: 'Quản lý đơn hàng',
              icon: Package,
              items: [
                { title: 'Tất cả đơn hàng', url: 'manage-order', icon: AlertCircle },
                { title: 'Yêu cầu thiết kế', url: 'manage-order/design-request', icon: Clock },
                { title: 'Đơn hàng bảo hành', url: 'manage-order/warranty', icon: CheckCircle }
              ]
            },
            { title: 'Quản lý voucher', url: 'manage-voucher', icon: Ticket },
            { title: 'Quản lý thanh toán', url: 'manage-transaction', icon: DollarSign }
          ]
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
            { title: 'Tổng quan chi nhánh', url: 'dashboard', icon: LayoutDashboard },
            { title: 'Báo cáo chi nhánh', url: 'reports', icon: BarChart3, badge: '3' }
          ]
        },
        {
          title: 'Vận hành',
          items: [
            { title: 'Quản lý lịch hẹn', url: 'manage-appointment', icon: CalendarDays, badge: '12' },
            { title: 'Thu ngân', url: 'cashier', icon: ShoppingCart },
            {
              title: 'Quản lý đơn hàng',
              icon: Package,
              items: [
                { title: 'Đơn hàng mới', url: 'manage-order', icon: AlertCircle, badge: '5' },
                { title: 'Đang xử lý', url: 'manage-order/processing', icon: Clock },
                { title: 'Hoàn thành', url: 'manage-order/completed', icon: CheckCircle }
              ]
            },
            { title: 'Quản lý kho', url: 'manage-inventory', icon: Package2 }
          ]
        },
        {
          title: 'Tương tác',
          items: [
            { title: 'Tin nhắn khách hàng', url: 'messages', icon: MessagesSquare, badge: '8' },
            { title: 'Check-in/Check-out', url: 'check-in-out', icon: UserCheck }
          ]
        },
        {
          title: 'Cài đặt',
          items: [{ title: 'Thông tin cá nhân', url: 'profile', icon: User }]
        }
      ]
    },
    {
      name: 'Designer',
      navGroups: [
        {
          title: 'Thiết kế',
          items: [
            { title: 'Bảng làm việc', url: 'dashboard', icon: LayoutDashboard },
            { title: 'Thống kê thiết kế', url: 'design-stats', icon: TrendingUp }
          ]
        },
        {
          title: 'Quản lý thiết kế',
          items: [
            {
              title: 'Mẫu thiết kế',
              icon: Palette,
              items: [
                { title: 'Thư viện mẫu', url: 'manage-template', icon: Shirt },
                { title: 'Tạo mẫu mới', url: 'manage-template/create', icon: PaintBucket },
                { title: 'Mẫu nổi bật', url: 'manage-template/featured', icon: Award }
              ]
            },
            { title: 'Yêu cầu thiết kế', url: 'manage-design-request', icon: Award, badge: '7' },
            { title: 'Công việc của tôi', url: 'manage-task', icon: ClipboardList }
          ]
        },
        {
          title: 'Tương tác',
          items: [
            { title: 'Chat với khách hàng', url: 'messages', icon: MessagesSquare, badge: '4' },
            { title: 'Phản hồi thiết kế', url: 'design-feedback', icon: FileText }
          ]
        },
        {
          title: 'Cài đặt',
          items: [{ title: 'Hồ sơ cá nhân', url: 'profile', icon: User }]
        }
      ]
    },
    {
      name: 'Manager',
      navGroups: [
        {
          title: 'Quản lý sản xuất',
          items: [
            { title: 'Tổng quan sản xuất', url: 'dashboard', icon: LayoutDashboard },
            { title: 'Báo cáo sản xuất', url: 'production-reports', icon: BarChart3 }
          ]
        },
        {
          title: 'Vận hành nhà máy',
          items: [
            {
              title: 'Quản lý sản xuất',
              icon: Factory,
              items: [
                { title: 'Dây chuyền sản xuất', url: 'manage-production', icon: Scissors },
                { title: 'Kiểm tra chất lượng', url: 'manage-production/qc', icon: CheckCircle }
              ]
            },
            { title: 'Quản lý mẫu', url: 'manage-template', icon: Palette },
            { title: 'Yêu cầu thiết kế', url: 'manage-design-request', icon: Award },
            { title: 'Đơn hàng sản xuất', url: 'manage-order', icon: Package, badge: '15' }
          ]
        },
        {
          title: 'Quản lý bảo hành',
          items: [{ title: 'Quản lý bảo hành', url: 'manage-warranty', icon: Shield }]
        },
        {
          title: 'Quản lý nhân sự',
          items: [
            { title: 'Phân công công việc', url: 'manage-task', icon: FolderOpen },
            { title: 'Theo dõi tiến độ', url: 'track-progress', icon: TrendingUp }
          ]
        },
        {
          title: 'Cài đặt',
          items: [{ title: 'Thông tin cá nhân', url: 'profile', icon: User }]
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
            { title: 'Nhiệm vụ của tôi', url: 'manage-task', icon: ClipboardList, badge: '5' },
            { title: 'Tiến độ công việc', url: 'work-progress', icon: TrendingUp }
          ]
        },
        {
          title: 'Bảo hành & Hỗ trợ',
          items: [
            { title: 'Yêu cầu bảo hành', url: 'warranty-requests', icon: Package2, badge: '2' },
            { title: 'Cập nhật trạng thái', url: 'status-updates', icon: CheckCircle }
          ]
        },
        {
          title: 'Cài đặt',
          items: [{ title: 'Thông tin cá nhân', url: 'profile', icon: User }]
        }
      ]
    }
  ]
}
