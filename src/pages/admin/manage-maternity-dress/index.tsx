import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash,
  ChevronDown,
  ChevronRight,
  Package2,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  Filter,
  Grid3X3,
  List,
  Star,
  Calendar,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'

import MaternityDressCreationDialog from './component/maternitydress-creation-dialog'
import ExpandedProductDetails from './component/expanded-maternity-details'
import { useMaternityDressStore } from '@/stores/admin/maternity-dress.store'
import dayjs from 'dayjs'
// React Query Hooks
import { useGetMaternityDresses, useDeleteMaternityDress } from '@/services/admin/maternity-dress.service'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Helper function để tính tổng giá và format tiền
const calculateTotalPrice = (price: Array<number> | number) => {
  if (!price) return 0
  // Nếu price là array
  if (Array.isArray(price)) {
    return price.reduce((total, p) => {
      const numPrice = typeof p === 'string' ? parseFloat(p) : p
      return total + (isNaN(numPrice) ? 0 : numPrice)
    }, 0)
  }

  // Nếu price là string hoặc number
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return isNaN(numPrice) ? 0 : numPrice
}

// Helper function để format tiền VNĐ
const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' VNĐ'
  )
}

// Component riêng để xử lý hình ảnh tránh vòng lặp
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder-image.jpg')
    }
  }

  if (hasError && imgSrc === '/placeholder-image.jpg') {
    return (
      <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 flex items-center justify-center border border-violet-200 dark:border-violet-700'>
        <Package2 className='h-7 w-7 text-violet-400' />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className='w-14 h-14 rounded-xl object-cover border-2 border-violet-200 dark:border-violet-700 shadow-sm'
      onError={handleError}
    />
  )
}

export default function MaternityDressPage() {
  // UI State from Zustand
  const {
    selectedMaternityDresses,
    searchTerm,
    filters,
    expandedMaternityDressId,
    isCreateMaternityDressDialogOpen,
    setFilters,
    selectMaternityDress,
    selectAllMaternityDresses,
    clearSelection,
    toggleMaternityDressExpansion,
    setCreateMaternityDressDialogOpen
  } = useMaternityDressStore()

  // Local UI state
  const [localSearch, setLocalSearch] = useState(filters.search)

  // React Query hooks
  const {
    data: maternityDressesData,
    isLoading,
    error
  } = useGetMaternityDresses({
    index: filters.index,
    pageSize: filters.pageSize,
    search: filters.search || undefined,
    sortBy: filters.sortBy
  })

  const deleteMaternityDressMutation = useDeleteMaternityDress()
  const maternityDresses = maternityDressesData?.data.items || []
  const pagination = maternityDressesData?.data

  // Filter dresses locally based on search and filters
  const filteredDresses = useMemo(() => {
    let filtered = maternityDresses

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (dress) =>
          dress.name.toLowerCase().includes(searchLower) ||
          dress.description.toLowerCase().includes(searchLower) ||
          dress.slug.toLowerCase().includes(searchLower)
      )
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((dress) => {
          const dressValue = dress[key as keyof typeof dress]
          return dressValue === value
        })
      }
    })

    return filtered
  }, [maternityDresses, searchTerm, filters])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilters({ search: localSearch, index: 1 })
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [localSearch, filters.search, setFilters])

  // Calculate stats from filtered dresses
  const totalDresses = filteredDresses.length
  // const incompleteDresses = filteredDresses.filter(dress => dress.status === 'Incomplete').length
  // const completeDresses = filteredDresses.filter(dress => dress.status === 'Complete').length
  const totalValue = filteredDresses.reduce((sum, dress) => sum + calculateTotalPrice(dress.price), 0)

  const getStatusBadge = (status: 'Complete' | 'Incomplete') => {
    const variants = {
      Complete: 'default',
      Incomplete: 'destructive'
    } as const

    const labels = {
      Complete: 'Hoàn thành',
      Incomplete: 'Chưa hoàn thành'
    }

    return (
      <Badge variant={variants[status]} className='font-medium'>
        {labels[status]}
      </Badge>
    )
  }

  const allSelected = filteredDresses.length > 0 && selectedMaternityDresses.length === filteredDresses.length

  const handlePageChange = (newPage: number) => {
    setFilters({ index: newPage })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setFilters({ pageSize: parseInt(newPageSize), index: 1 })
  }

  const handleSortChange = (newSort: string) => {
    setFilters({ sortBy: newSort, index: 1 })
  }

  const handleResetFilters = () => {
    setLocalSearch('')
    setFilters({ index: 1 })
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

  const handleDeleteDress = async (dressId: string) => {
    try {
      await deleteMaternityDressMutation.mutateAsync(dressId)
    } catch (error) {
      console.error('Error deleting dress:', error)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-50/30 via-white to-pink-50/20 dark:from-violet-950/20 dark:via-background dark:to-pink-950/10'>
      <div className='space-y-8 py-8 px-6 max-w-7xl mx-auto'>
        {/* Enhanced Header with Gradient */}
        <div className='relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl opacity-90'></div>
          <div className='absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20 rounded-3xl'></div>
          <div className='relative p-8 text-white'>
            <div className='flex items-center justify-between'>
              <div className='space-y-2'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                    <Sparkles className='h-6 w-6 text-white' />
                  </div>
                  <h1 className='text-4xl font-bold tracking-tight'>Quản Lý Đầm Bầu</h1>
                </div>
                <p className='text-violet-100 text-lg'>Tạo và quản lý các mẫu đầm bầu độc đáo cho mẹ bầu xinh đẹp</p>
                <div className='flex items-center gap-6 text-sm text-violet-100 mt-4'>
                  <div className='flex items-center gap-2'>
                    <Package2 className='h-4 w-4' />
                    <span>{totalDresses} đầm bầu</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <TrendingUp className='h-4 w-4' />
                    <span>{formatCurrency(totalValue)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Star className='h-4 w-4' />
                    {/* <span>{completeDresses} hoàn thành</span> */}
                    <span> 10 hoàn thành</span>
                  </div>
                </div>
              </div>
              <div className='flex flex-col items-end gap-4'>
                <Button
                  onClick={() => setCreateMaternityDressDialogOpen(true)}
                  size='lg'
                  className='bg-white hover:bg-violet-50 text-violet-600 shadow-lg hover:shadow-xl transition-all duration-300 px-8'
                >
                  <Plus className='h-5 w-5 mr-2' />
                  Tạo Đầm Bầu Mới
                </Button>
                <div className='flex items-center gap-2 text-white/80 text-sm'>
                  <Calendar className='h-4 w-4' />
                  <span>Cập nhật {dayjs().format('DD/MM/YYYY')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          <Card className='border-0 shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white overflow-hidden'>
            <CardContent className='p-6 relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10'></div>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-violet-100 text-sm font-medium'>Tổng đầm bầu</p>
                  <p className='text-3xl font-bold mt-1'>{totalDresses}</p>
                  <p className='text-violet-200 text-xs mt-1'>+12% so với tháng trước</p>
                </div>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <Package2 className='h-8 w-8' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-0 shadow-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white overflow-hidden'>
            <CardContent className='p-6 relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10'></div>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-rose-100 text-sm font-medium'>Chưa hoàn thành</p>
                  <p className='text-3xl font-bold mt-1'>0</p>
                  <p className='text-rose-200 text-xs mt-1'>Cần hoàn thiện</p>
                </div>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <AlertCircle className='h-8 w-8' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden'>
            <CardContent className='p-6 relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10'></div>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-emerald-100 text-sm font-medium'>Đã hoàn thành</p>
                  <p className='text-3xl font-bold mt-1'>0</p>
                  <p className='text-emerald-200 text-xs mt-1'>Sẵn sàng bán</p>
                </div>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <Star className='h-8 w-8' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-0 shadow-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white overflow-hidden'>
            <CardContent className='p-6 relative'>
              <div className='absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10'></div>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-orange-100 text-sm font-medium'>Tổng giá trị</p>
                  <p className='text-2xl font-bold mt-1'>{formatCurrency(totalValue)}</p>
                  <p className='text-orange-200 text-xs mt-1'>Doanh thu tiềm năng</p>
                </div>
                <div className='p-3 bg-white/20 rounded-xl backdrop-blur-sm'>
                  <TrendingUp className='h-8 w-8' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'>
            <CardContent className='p-4'>
              <div className='flex items-center gap-3 text-red-600 dark:text-red-400'>
                <div className='p-2 bg-red-100 dark:bg-red-900/30 rounded-full'>
                  <AlertCircle className='h-5 w-5' />
                </div>
                <div>
                  <h4 className='font-semibold'>Có lỗi xảy ra</h4>
                  <p className='text-sm opacity-90'>
                    {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Search and Filters */}
        <Card className='border-0 shadow-lg bg-white/80 backdrop-blur-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1'>
                <div className='relative flex-1 max-w-md'>
                  <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                    <Search className='text-violet-400 h-5 w-5' />
                  </div>
                  <Input
                    placeholder='Tìm kiếm theo tên, mô tả hoặc slug...'
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className='pl-12 h-12 border-violet-200 focus:border-violet-400 focus:ring-violet-400 rounded-xl bg-white'
                  />
                </div>

                <div className='flex gap-3'>
                  <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className='w-[180px] h-12 border-violet-200 rounded-xl bg-white'>
                      <Filter className='h-4 w-4 mr-2 text-violet-400' />
                      <SelectValue placeholder='Sắp xếp' />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={`sort-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.pageSize?.toString() || '10'} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className='w-[140px] h-12 border-violet-200 rounded-xl bg-white'>
                      <List className='h-4 w-4 mr-2 text-violet-400' />
                      <SelectValue placeholder='Số lượng' />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((option) => (
                        <SelectItem key={`pagesize-${option.value}`} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                variant='outline'
                onClick={handleResetFilters}
                className='border-violet-200 hover:bg-violet-50 text-violet-600 rounded-xl h-12 px-6'
              >
                <RotateCcw className='h-4 w-4 mr-2' />
                Đặt lại bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Bulk Actions */}
        {selectedMaternityDresses.length > 0 && (
          <Card className='border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 shadow-lg'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg'>
                    <Grid3X3 className='h-5 w-5 text-violet-600' />
                  </div>
                  <div>
                    <p className='font-semibold text-violet-700 dark:text-violet-300'>
                      Đã chọn {selectedMaternityDresses.length} đầm bầu
                    </p>
                    <p className='text-sm text-violet-600 dark:text-violet-400'>
                      Thực hiện các thao tác trên các mục đã chọn
                    </p>
                  </div>
                </div>
                <div className='flex gap-3'>
                  <Button
                    size='sm'
                    variant='destructive'
                    className='h-10 rounded-lg shadow-sm'
                    disabled={deleteMaternityDressMutation.isPending}
                  >
                    <Trash className='h-4 w-4 mr-2' />
                    Xóa đã chọn
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={clearSelection}
                    className='h-10 rounded-lg border-violet-200 hover:bg-violet-50'
                  >
                    Bỏ chọn tất cả
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Table */}
        <Card className='border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 hover:bg-gradient-to-r hover:from-violet-100 hover:to-purple-100'>
                <TableHead className='w-8 pl-6'></TableHead>
                <TableHead className='w-12'>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      const dressIds = filteredDresses.map((d) => d.id)
                      selectAllMaternityDresses(dressIds, !!checked)
                    }}
                    className='border-violet-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500'
                  />
                </TableHead>
                <TableHead className='font-semibold text-violet-700'>Đầm Bầu</TableHead>
                <TableHead className='font-semibold text-violet-700'>Mô Tả</TableHead>
                <TableHead className='font-semibold text-violet-700'>Giá</TableHead>
                <TableHead className='font-semibold text-violet-700'>Trạng Thái</TableHead>
                <TableHead className='font-semibold text-violet-700'>Ngày Tạo</TableHead>
                <TableHead className='w-12 pr-6'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-16'>
                    <div className='flex flex-col items-center gap-4'>
                      <div className='relative'>
                        <div className='animate-spin rounded-full h-12 w-12 border-4 border-violet-200'></div>
                        <div className='animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent absolute inset-0'></div>
                      </div>
                      <div className='space-y-2 text-center'>
                        <p className='text-violet-600 font-medium'>Đang tải dữ liệu...</p>
                        <p className='text-violet-400 text-sm'>Vui lòng chờ trong giây lát</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : maternityDresses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-16'>
                    <div className='text-center space-y-6'>
                      <div className='mx-auto w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center'>
                        <Package2 className='h-12 w-12 text-violet-400' />
                      </div>
                      <div className='space-y-2'>
                        <h3 className='text-xl font-semibold text-gray-900'>
                          {filters.search ? 'Không tìm thấy đầm bầu nào' : 'Chưa có đầm bầu nào'}
                        </h3>
                        <p className='text-gray-500 max-w-md mx-auto'>
                          {filters.search
                            ? 'Không tìm thấy đầm bầu phù hợp với từ khóa tìm kiếm. Hãy thử với từ khóa khác.'
                            : 'Bạn chưa tạo đầm bầu nào. Hãy tạo đầm bầu đầu tiên để bắt đầu kinh doanh.'}
                        </p>
                      </div>
                      <Button
                        onClick={() => setCreateMaternityDressDialogOpen(true)}
                        className='bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300'
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Tạo đầm bầu đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                maternityDresses
                  .map((dress) => [
                    /* Enhanced Main Dress Row */
                    <TableRow
                      key={`dress-${dress.id}`}
                      className='hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 cursor-pointer transition-all duration-200 border-b border-violet-100/50 group'
                      onClick={() => toggleMaternityDressExpansion(dress.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()} className='pl-6'>
                        <div className='flex items-center justify-center p-1'>
                          {expandedMaternityDressId === dress.id ? (
                            <ChevronDown className='h-4 w-4 text-violet-500 transition-transform duration-200' />
                          ) : (
                            <ChevronRight className='h-4 w-4 text-violet-400 group-hover:text-violet-500 transition-colors duration-200' />
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMaternityDresses.includes(dress.id)}
                          onCheckedChange={() => selectMaternityDress(dress.id)}
                          className='border-violet-300 data-[state=checked]:bg-violet-500 data-[state=checked]:border-violet-500'
                        />
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-4'>
                          {dress.images && dress.images.length > 0 ? (
                            <ProductImage src={dress.images[0]} alt={dress.name} />
                          ) : (
                            <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center border border-violet-200 dark:border-violet-700'>
                              <Package2 className='h-7 w-7 text-violet-400' />
                            </div>
                          )}
                          <div className='space-y-1'>
                            <div className='font-semibold text-gray-900 group-hover:text-violet-700 transition-colors duration-200'>
                              {dress.name}
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                              <Badge variant='secondary' className='bg-violet-100 text-violet-700 border-violet-200'>
                                {dress.styleName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-xs'>
                          <p className='text-gray-600 line-clamp-2 text-sm leading-relaxed' title={dress.description}>
                            {dress.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-1'>
                          <span className='font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent'>
                            {formatCurrency(calculateTotalPrice(dress.price))}
                          </span>
                          <span className='text-xs text-gray-500'>Giá cơ bản</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getStatusBadge('Complete')}
                          <div className='w-2 h-2 rounded-full bg-green-400 animate-pulse'></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Calendar className='h-4 w-4 text-violet-400' />
                          <span>{dayjs(dress.createdAt).format('DD/MM/YYYY')}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className='pr-6'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-9 w-9 p-0 hover:bg-violet-50 rounded-lg transition-colors duration-200'
                            >
                              <MoreHorizontal className='h-4 w-4 text-violet-500' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-48 shadow-lg border-0'>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDress(dress.id)}
                              className='text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg'
                              disabled={deleteMaternityDressMutation.isPending}
                            >
                              <Trash className='h-4 w-4 mr-2' />
                              {deleteMaternityDressMutation.isPending ? 'Đang xóa...' : 'Xóa đầm bầu'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>,

                    /* Enhanced Expanded Dress Details */
                    ...(expandedMaternityDressId === dress.id
                      ? [
                          <TableRow
                            key={`expanded-${dress.id}`}
                            className='bg-gradient-to-r from-violet-50/30 to-purple-50/30'
                          >
                            <TableCell colSpan={8} className='p-0'>
                              <div className='border-t-2 border-violet-200'>
                                <ExpandedProductDetails />
                              </div>
                            </TableCell>
                          </TableRow>
                        ]
                      : [])
                  ])
                  .flat()
              )}
            </TableBody>
          </Table>

          {/* Enhanced Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className='bg-gradient-to-r from-violet-50/50 to-purple-50/50 border-t border-violet-100'>
              <div className='flex items-center justify-between px-6 py-4'>
                <div className='flex items-center gap-2 text-sm text-violet-600'>
                  <div className='flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm'>
                    <List className='h-4 w-4' />
                    <span className='font-medium'>
                      Hiển thị {(pagination.pageNumber - 1) * pagination.pageSize + 1} -{' '}
                      {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}
                      trong tổng số {pagination.totalCount} đầm bầu
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={!pagination.hasPreviousPage}
                    className='border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg h-10'
                  >
                    <ChevronLeft className='h-4 w-4 mr-1' />
                    Trước
                  </Button>

                  <div className='flex items-center gap-1'>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum =
                        pagination.pageNumber <= 3
                          ? i + 1
                          : pagination.pageNumber >= pagination.totalPages - 2
                            ? pagination.totalPages - 4 + i
                            : pagination.pageNumber - 2 + i

                      if (pageNum < 1 || pageNum > pagination.totalPages) return null

                      return (
                        <Button
                          key={`page-${pageNum}`}
                          variant={pageNum === pagination.pageNumber ? 'default' : 'outline'}
                          size='sm'
                          onClick={() => handlePageChange(pageNum)}
                          className={
                            pageNum === pagination.pageNumber
                              ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-0 text-white shadow-md h-10 w-10'
                              : 'border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg h-10 w-10'
                          }
                        >
                          {pageNum}
                        </Button>
                      )
                    }).filter(Boolean)}
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={!pagination.hasNextPage}
                    className='border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg h-10'
                  >
                    Sau
                    <ChevronRight className='h-4 w-4 ml-1' />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Enhanced Footer Stats */}
        <Card className='border-0 shadow-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20'>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
              <div className='flex flex-wrap items-center gap-6 text-sm'>
                <div className='flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm'>
                  <div className='w-3 h-3 rounded-full bg-violet-500'></div>
                  <span className='text-violet-700 font-medium'>Hiển thị {filteredDresses.length} đầm bầu</span>
                </div>
                <div className='flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm'>
                  <TrendingUp className='h-4 w-4 text-green-500' />
                  <span className='text-gray-600'>
                    Tổng giá trị: <strong className='text-green-600'>{formatCurrency(totalValue)}</strong>
                  </span>
                </div>
                {selectedMaternityDresses.length > 0 && (
                  <div className='flex items-center gap-2 bg-violet-100 rounded-lg px-4 py-2'>
                    <div className='w-3 h-3 rounded-full bg-violet-600'></div>
                    <span className='text-violet-700 font-medium'>
                      Đã chọn {selectedMaternityDresses.length} đầm bầu
                    </span>
                  </div>
                )}
              </div>
              {selectedMaternityDresses.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearSelection}
                  className='text-violet-600 hover:bg-violet-100 rounded-lg h-9'
                >
                  Bỏ chọn tất cả
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <MaternityDressCreationDialog
          open={isCreateMaternityDressDialogOpen}
          onOpenChange={setCreateMaternityDressDialogOpen}
        />
      </div>
    </div>
  )
}
