import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { Baby, Sparkles } from 'lucide-react'
// Giả sử bạn đã có file logo svg trong thư mục public/images
import Logo from '/images/mamafit-logo.svg' 
import { cn } from '@/lib/utils/utils'

export function LogoHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton 
          // Loại bỏ size='lg' để đảm bảo kích thước chuẩn, thẳng hàng
          className='group relative h-auto py-3 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all duration-300'
          tooltip={isCollapsed ? 'MamaFit Studio' : undefined}
        >
          {/* Hiệu ứng nền khi hover, chỉ hiển thị khi mở rộng */}
          {!isCollapsed && (
            <div className='absolute inset-0 bg-gradient-to-r from-violet-100/0 via-violet-100/50 to-violet-100/0 dark:from-violet-900/0 dark:via-violet-900/20 dark:to-violet-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
          )}
          
          {/* Logo được nâng cấp */}
          <div className={cn(
            'relative bg-gradient-to-br from-violet-100 to-violet-50 dark:from-violet-900 dark:to-violet-950',
            'flex aspect-square size-10 items-center justify-center rounded-xl',
            'shadow-lg shadow-violet-500/10 ring-1 ring-violet-200/50 dark:ring-violet-800/50',
            'group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 flex-shrink-0'
          )}>
            <img 
              src={Logo} 
              className='size-8 group-hover:scale-110 transition-transform duration-300' 
              alt='MamaFit Logo'
            />
            {/* Chi tiết trang trí: icon em bé, chỉ hiển thị khi mở rộng */}
            {!isCollapsed && (
              <Baby className='absolute -top-1.5 -right-1.5 size-4 text-violet-500 bg-white dark:bg-violet-900 rounded-full p-0.5' />
            )}
          </div>
          
          {/* Nội dung text, chỉ hiển thị khi mở rộng */}
          {!isCollapsed && (
            <div className='relative ml-3 grid flex-1 text-left overflow-hidden'>
              <div className='flex items-center gap-1.5'>
                <span className='truncate font-bold text-lg bg-gradient-to-r from-violet-600 to-violet-500 dark:from-violet-400 dark:to-violet-300 bg-clip-text text-transparent'>
                  MamaFit
                </span>
                <Sparkles className='size-3.5 text-violet-400 animate-pulse flex-shrink-0' />
              </div>
              <span className='truncate text-xs text-muted-foreground font-medium'>
                Váy bầu & May đo theo yêu cầu
              </span>
            </div>
          )}
          
          {/* Trạng thái hoạt động, thay thế chấm tròn cũ */}
          <div className={cn(
            'absolute', 
            isCollapsed ? 'top-1 right-1' : 'top-2 right-2'
          )}>
            <span className='relative flex h-2.5 w-2.5'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75' />
              <span className='relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500' />
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}