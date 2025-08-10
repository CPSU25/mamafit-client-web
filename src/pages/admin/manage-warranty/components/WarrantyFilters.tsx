import { Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WarrantyFiltersProps } from '../types'

export const WarrantyFilters = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: WarrantyFiltersProps) => {
  return (
    <Card className='mb-6 border-0 shadow-lg bg-gradient-to-r from-white to-gray-50'>
      <CardContent className='pt-6'>
        <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center'>
          <div className='flex-1 min-w-0'>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-violet-400 w-5 h-5' />
              <Input
                placeholder='🔍 Tìm kiếm theo mã SKU, tên khách hàng, số điện thoại...'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className='pl-12 h-12 text-base border-gray-200 focus:border-violet-400 focus:ring-violet-400 bg-white shadow-sm'
              />
            </div>
          </div>

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className='w-full lg:w-64 h-12 border-gray-200 focus:border-violet-400 focus:ring-violet-400 bg-white shadow-sm'>
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4 text-violet-600' />
                <SelectValue placeholder='Lọc theo trạng thái' />
              </div>
            </SelectTrigger>
            <SelectContent className='min-w-64'>
              <SelectItem value='all' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-gray-400'></div>
                  <span>Tất cả trạng thái</span>
                </div>
              </SelectItem>
              <SelectItem value='pending' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-amber-400'></div>
                  <span>Chờ xử lý</span>
                </div>
              </SelectItem>
              <SelectItem value='in_transit' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-blue-400'></div>
                  <span>Đang vận chuyển</span>
                </div>
              </SelectItem>
              <SelectItem value='repairing' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-orange-400'></div>
                  <span>Đang sửa chữa</span>
                </div>
              </SelectItem>
              <SelectItem value='completed' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-green-400'></div>
                  <span>Hoàn thành</span>
                </div>
              </SelectItem>
              <SelectItem value='partially_rejected' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-orange-600'></div>
                  <span>Từ chối một phần</span>
                </div>
              </SelectItem>
              <SelectItem value='fully_rejected' className='py-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-3 h-3 rounded-full bg-red-400'></div>
                  <span>Từ chối hoàn toàn</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
