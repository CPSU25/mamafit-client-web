import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Laptop, Moon, Sun } from 'lucide-react'
import { useSearch } from '@/context/search-context'
import { useTheme } from '@/components/providers/theme.provider'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { sidebarData } from '@/components/layout/data/sidebar-data'
import { ScrollArea } from './ui/scroll-area'
import { useAuth } from '@/context/auth-context'
import { NavItem } from '@/components/layout/types' // Đảm bảo import NavItem

// Kiểu dữ liệu cho một item đã được làm phẳng
interface FlatNavItem {
  title: string
  url: string
  // `value` dùng để tìm kiếm, ví dụ: "Quản lý hệ thống > Quản lý người dùng"
  value: string
  breadcrumbs: string[]
}

export function CommandMenu() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { open, setOpen } = useSearch()
  const { userPermission } = useAuth()

  const currentUserRole = userPermission?.roleName || 'Admin'

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const currentRoleData = sidebarData.role.find((role) => role.name === currentUserRole)

  // *** LOGIC CẢI TIẾN: HÀM ĐỆ QUY ĐỂ "LÀM PHẲNG" CÂY MENU ***
  // Hàm này sẽ biến cấu trúc menu lồng nhau thành một danh sách các link đơn giản.
  const flattenNavItems = (items: NavItem[], breadcrumbs: string[] = []): FlatNavItem[] => {
    let flatList: FlatNavItem[] = []

    items.forEach((item) => {
      // Nếu item là một link (có url), thêm nó vào danh sách
      if ('url' in item) {
        flatList.push({
          title: item.title,
          url: item.url ?? '',
          value: [...breadcrumbs, item.title].join(' '),
          breadcrumbs: breadcrumbs
        })
      }
      // Nếu item là một nhóm (có items), gọi đệ quy cho các mục con của nó
      else if ('items' in item) {
        const newBreadcrumbs = [...breadcrumbs, item.title]
        flatList = [...flatList, ...flattenNavItems(item.items, newBreadcrumbs)]
      }
    })

    return flatList
  }

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Nhập lệnh hoặc tìm kiếm...' />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pr-1'>
          <CommandEmpty>Không tìm thấy kết quả.</CommandEmpty>

          {currentRoleData?.navGroups.map((group) => (
            <CommandGroup key={`${currentUserRole}-group-${group.title}`} heading={group.title}>
              {/* *** LOGIC RENDER ĐƠN GIẢN HƠN *** */}
              {/* Lặp qua danh sách đã được làm phẳng, không cần logic lồng nhau phức tạp */}
              {flattenNavItems(group.items).map((item) => (
                <CommandItem
                  key={item.url}
                  value={item.value}
                  onSelect={() => {
                    // Hoàn toàn type-safe vì item.url chắc chắn là string
                    runCommand(() => navigate(item.url))
                  }}
                  className='flex flex-col items-start'
                >
                  <div className='flex items-center'>
                    <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                      <ArrowRight className='text-muted-foreground/80 size-2' />
                    </div>
                    <span>{item.title}</span>
                  </div>
                  {item.breadcrumbs.length > 0 && (
                     <div className='text-xs text-muted-foreground ml-6'>
                      {item.breadcrumbs.join(' > ')}
                    </div>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          <CommandSeparator />
          <CommandGroup heading='Giao diện'>
            <CommandItem key='theme-light' onSelect={() => runCommand(() => setTheme('light'))}>
              <Sun className='mr-2 h-4 w-4' />
              <span>Sáng</span>
            </CommandItem>
            <CommandItem key='theme-dark' onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className='mr-2 h-4 w-4 scale-90' />
              <span>Tối</span>
            </CommandItem>
            <CommandItem key='theme-system' onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop className='mr-2 h-4 w-4' />
              <span>Hệ thống</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
