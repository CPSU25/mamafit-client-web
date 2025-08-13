import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

type FiltersBarProps = {
  localSearch?: string
  onLocalSearchChange: (value: string) => void
  sortBy?: string
  pageSize: string
  onSortChange: (value: string) => void
  onPageSizeChange: (value: string) => void
  onReset: () => void
}

const sortOptions = [
  { value: 'CREATED_AT_DESC', label: 'Mới nhất' },
  { value: 'CREATED_AT_ASC', label: 'Cũ nhất' },
  { value: 'NAME_ASC', label: 'Tên A-Z' },
  { value: 'NAME_DESC', label: 'Tên Z-A' }
]

const pageSizeOptions = [
  { value: '5', label: '5 / trang' },
  { value: '10', label: '10 / trang' },
  { value: '20', label: '20 / trang' },
  { value: '50', label: '50 / trang' }
]

export default function FiltersBar(props: FiltersBarProps) {
  const { localSearch = '', onLocalSearchChange, sortBy, pageSize, onSortChange, onPageSizeChange, onReset } = props

  return (
    <Card className='border-0'>
      <CardContent className='p-4'>
        <div className='flex flex-col lg:flex-row gap-4 lg:items-center justify-between'>
          <div className='flex flex-1 items-center gap-3'>
            <div className='relative w-full max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                value={localSearch}
                onChange={(e) => onLocalSearchChange(e.target.value)}
                placeholder='Tìm kiếm theo tên, mô tả hoặc slug...'
                className='pl-9 h-9'
              />
            </div>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className='w-[180px] h-9'>
                <SelectValue placeholder='Sắp xếp' />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={pageSize} onValueChange={onPageSizeChange}>
              <SelectTrigger className='w-[140px] h-9'>
                <SelectValue placeholder='Số lượng' />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant='outline' className='h-9' onClick={onReset}>
            <RotateCcw className='h-4 w-4 mr-2' />Đặt lại
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
