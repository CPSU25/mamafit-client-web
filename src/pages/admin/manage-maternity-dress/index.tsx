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
  ChevronLeft
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
      <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
        <Package2 className='h-6 w-6 text-muted-foreground' />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className='w-12 h-12 rounded-lg object-cover border-2 border-border'
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
  // const [showFilters, setShowFilters] = useState(false)
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
  // const updateMaternityDressMutation = useUpdateMaternityDress()
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
  // Calculate stats from filtered dresses với tổng giá trị thực
  // const totalDresses = filteredDresses.length
  // const incompleteDresses = 0 // Mock data - will be implemented when status field is available
  // const completeDresses = totalDresses // Mock data - will be implemented when status field is available
  // const totalValue = filteredDresses.reduce((sum, dress) => sum + calculateTotalPrice(dress.price), 0)

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
    { value: 'createdat_desc', label: 'Mới nhất' },
    { value: 'createdat_asc', label: 'Cũ nhất' },
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' }
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
    <div className='space-y-6 py-4 min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>Quản Lý Đầm Bầu</h1>
          <p className='text-muted-foreground mt-1'>Quản lý các mẫu đầm bầu và thông tin chi tiết</p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            onClick={() => setCreateMaternityDressDialogOpen(true)}
            className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
          >
            <Plus className='h-4 w-4 mr-2' />
            Tạo Đầm Bầu Mới
          </Button>
        </div>
      </div>

      {/* Stats Cards - Uncommented và updated với tổng giá trị thực */}
      {/* <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Tổng đầm bầu</p>
                <p className='text-2xl font-bold text-foreground'>{totalDresses}</p>
              </div>
              <Package2 className='h-8 w-8 text-primary' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Chưa hoàn thành</p>
                <p className='text-2xl font-bold text-destructive'>{incompleteDresses}</p>
              </div>
              <AlertCircle className='h-8 w-8 text-destructive' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Đã hoàn thành</p>
                <p className='text-2xl font-bold text-accent'>{completeDresses}</p>
              </div>
              <TrendingUp className='h-8 w-8 text-accent' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Tổng giá trị</p>
                <p className='text-2xl font-bold text-secondary'>{formatCurrency(totalValue)}</p>
              </div>
              <div className='h-8 w-8 bg-secondary/20 rounded-full flex items-center justify-center'>
                <span className='text-secondary font-bold text-sm'>₫</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Error Alert */}
      {error && (
        <Card className='border-destructive/20 bg-destructive/10'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-4 w-4' />
              <span className='text-sm'>
                {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='Tìm kiếm danh mục...'
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className='pl-10 border-border focus:border-primary focus:ring-primary'
                />
              </div>

              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className='w-[180px] border-border'>
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
                <SelectTrigger className='w-[130px] border-border'>
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

            <Button variant='outline' onClick={handleResetFilters} className='border-border hover:bg-muted'>
              <RotateCcw className='h-4 w-4 mr-2' />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMaternityDresses.length > 0 && (
        <Card className='border-l-4 border-l-primary bg-primary/10 border-primary/20'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-primary'>
                Đã chọn {selectedMaternityDresses.length} đầm bầu
              </span>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='destructive'
                  className='h-8'
                  disabled={deleteMaternityDressMutation.isPending}
                >
                  <Trash className='h-3 w-3 mr-1' />
                  Xóa đã chọn
                </Button>
                <Button size='sm' variant='outline' onClick={clearSelection} className='h-8'>
                  Bỏ chọn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dresses Table */}
      <Card className='border-1 shadow-md bg-background py-0'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-8'></TableHead>
              <TableHead className='w-12'>
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    const dressIds = filteredDresses.map((d) => d.id)
                    selectAllMaternityDresses(dressIds, !!checked)
                  }}
                />
              </TableHead>
              <TableHead className='font-semibold'>Đầm Bầu</TableHead>
              <TableHead className='font-semibold'>Mô Tả</TableHead>
              <TableHead className='font-semibold'>Giá</TableHead>
              <TableHead className='font-semibold'>Trạng Thái</TableHead>
              <TableHead className='font-semibold'>Ngày Tạo</TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-12'>
                  <div className='flex flex-col items-center gap-2'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    <p className='text-muted-foreground'>Đang tải...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : maternityDresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-12'>
                  <div className='text-center py-12'>
                    <Package2 className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
                    <h3 className='text-lg font-medium text-foreground mb-2'>Không có danh mục nào</h3>
                    <p className='text-muted-foreground mb-4'>
                      {filters.search
                        ? 'Không tìm thấy danh mục phù hợp với từ khóa tìm kiếm'
                        : 'Chưa có danh mục nào được tạo'}
                    </p>
                    <Button
                      onClick={() => setCreateMaternityDressDialogOpen(true)}
                      className='bg-primary hover:bg-primary/90 text-primary-foreground'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Tạo danh mục đầu tiên
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              maternityDresses
                .map((dress) => [
                  /* Main Dress Row */
                  <TableRow
                    key={`dress-${dress.id}`}
                    className='hover:bg-primary/5 cursor-pointer transition-colors border-b border-border'
                    onClick={() => toggleMaternityDressExpansion(dress.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className='flex items-center justify-center'>
                        {expandedMaternityDressId === dress.id ? (
                          <ChevronDown className='h-4 w-4 text-primary' />
                        ) : (
                          <ChevronRight className='h-4 w-4 text-muted-foreground' />
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedMaternityDresses.includes(dress.id)}
                        onCheckedChange={() => selectMaternityDress(dress.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        {dress.images && dress.images.length > 0 ? (
                          <ProductImage src={dress.images[0]} alt={dress.name} />
                        ) : (
                          <div className='w-12 h-12 rounded-lg bg-muted flex items-center justify-center'>
                            <Package2 className='h-6 w-6 text-muted-foreground' />
                          </div>
                        )}
                        <div>
                          <div className='font-semibold text-foreground'>{dress.name}</div>
                          <div className='text-sm text-muted-foreground'>Style: {dress.styleName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-xs truncate' title={dress.description}>
                        {dress.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1 '>
                        <span className='font-semibold text-foreground'>
                          {formatCurrency(calculateTotalPrice(dress.price))}
                        </span>
                        {/* {Array.isArray(dress.price) && dress.price.length > 1 && (
                          <span className='text-xs text-muted-foreground'>
                            ({dress.price.length} mức giá)
                          </span>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge('Complete')}</TableCell>
                    <TableCell>
                      <span className='text-sm text-muted-foreground'>
                        {dayjs(dress.createdAt).format('DD/MM/YYYY')}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-40'>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDress(dress.id)}
                            className='text-destructive focus:text-destructive'
                            disabled={deleteMaternityDressMutation.isPending}
                          >
                            <Trash className='h-4 w-4 mr-2' />
                            {deleteMaternityDressMutation.isPending ? 'Đang xóa...' : 'Xóa đầm bầu'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>,

                  /* Expanded Dress Details */
                  ...(expandedMaternityDressId === dress.id
                    ? [
                        <TableRow key={`expanded-${dress.id}`}>
                          <TableCell colSpan={8} className='p-0 bg-background'>
                            <ExpandedProductDetails />
                          </TableCell>
                        </TableRow>
                      ]
                    : [])
                ])
                .flat()
            )}
          </TableBody>
        </Table>
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between px-6 py-4 border-t border-border'>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span>
                Hiển thị {(pagination.pageNumber - 1) * pagination.pageSize + 1} -{' '}
                {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}
                trong tổng số {pagination.totalCount} danh mục
              </span>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={!pagination.hasPreviousPage}
                className='border-border'
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
                      className={pageNum === pagination.pageNumber ? 'bg-primary hover:bg-primary/90' : 'border-border'}
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
                className='border-border'
              >
                Sau
                <ChevronRight className='h-4 w-4 ml-1' />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Footer Stats - Updated với total value thực */}
      {/* <Card className='border-0 shadow-sm py-0'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-4'>
              <span>Hiển thị {filteredDresses.length} đầm bầu</span>
              <span>• Tổng giá trị: <strong className='text-secondary'>{formatCurrency(totalValue)}</strong></span>
              {selectedMaternityDresses.length > 0 && (
                <span className='text-primary font-medium'>• Đã chọn {selectedMaternityDresses.length} đầm bầu</span>
              )}
            </div>
            {selectedMaternityDresses.length > 0 && (
              <Button variant='ghost' size='sm' onClick={clearSelection} className='h-8'>
                Bỏ chọn tất cả
              </Button>
            )}
          </div>
        </CardContent>
      </Card> */}

      {/* Dialogs */}
      <MaternityDressCreationDialog
        open={isCreateMaternityDressDialogOpen}
        onOpenChange={setCreateMaternityDressDialogOpen}
      />
    </div>
  )
}
