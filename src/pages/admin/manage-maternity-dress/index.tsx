import { useState, useEffect, useMemo } from 'react'
import { Plus, MoreHorizontal, Trash, ChevronDown, ChevronRight, Package2, AlertCircle, Calendar } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import MaternityDressCreationDialog from './component/maternitydress-creation-dialog'
import ExpandedProductDetails from './component/expanded-maternity-details'
import { useMaternityDressStore } from '@/stores/admin/maternity-dress.store'
import dayjs from 'dayjs'
import { useGetMaternityDresses, useDeleteMaternityDress } from '@/services/admin/maternity-dress.service'
import FiltersBar from './component/filters-bar'
import BulkActions from './component/bulk-actions'

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
      <div className='w-14 h-14 rounded-xl bg-muted flex items-center justify-center border'>
        <Package2 className='h-7 w-7 text-muted-foreground' />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
  className='w-14 h-14 rounded-xl object-cover border shadow-sm'
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
  const maternityDresses = useMemo(() => maternityDressesData?.data.items ?? [], [maternityDressesData])
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
  // const totalDresses = filteredDresses.length
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

  const handleSortChange = (newSort: string) => setFilters({ sortBy: newSort, index: 1 })
  const handleResetFilters = () => {
    setLocalSearch('')
    setFilters({ index: 1 })
  }

  const handleDeleteDress = async (dressId: string) => {
    try {
      await deleteMaternityDressMutation.mutateAsync(dressId)
    } catch (error) {
      console.error('Error deleting dress:', error)
    }
  }

  return (
    <Main className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-lg bg-muted flex items-center justify-center'>
            <Package2 className='h-6 w-6 text-muted-foreground' />
          </div>
          <div>
            <h1 className='text-2xl font-semibold'>Quản Lý Đầm Bầu</h1>
            <p className='text-sm text-muted-foreground'>Tạo và quản lý các mẫu đầm bầu</p>
          </div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <Button onClick={() => setCreateMaternityDressDialogOpen(true)} className='h-9'>
            <Plus className='h-4 w-4 mr-2' />Tạo Đầm Bầu
          </Button>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Calendar className='h-3.5 w-3.5' />
            <span>Cập nhật {dayjs().format('DD/MM/YYYY')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar
        localSearch={localSearch}
        onLocalSearchChange={setLocalSearch}
        sortBy={filters.sortBy}
        pageSize={(filters.pageSize || 10).toString()}
        onSortChange={handleSortChange}
        onPageSizeChange={handlePageSizeChange}
        onReset={handleResetFilters}
      />

  {/* Error Alert */}
      {error && (
        <Card className='border-destructive/20 bg-destructive/5'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              <p className='text-sm'>{error instanceof Error ? error.message : 'Không thể tải dữ liệu'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      <BulkActions
        count={selectedMaternityDresses.length}
        onClear={clearSelection}
        onDeleteSelectedDisabled={deleteMaternityDressMutation.isPending}
        onDeleteSelected={async () => {
          for (const id of selectedMaternityDresses) {
            try {
              await deleteMaternityDressMutation.mutateAsync(id)
            } catch (err) {
              console.error('Batch delete error', err)
            }
          }
        }}
      />

      {/* Table */}
      <Card className='border-0 shadow-sm'>
          <Table>
            <TableHeader>
            <TableRow>
                <TableHead className='w-8 pl-6'></TableHead>
                <TableHead className='w-12'>
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => {
                      const dressIds = filteredDresses.map((d) => d.id)
                      selectAllMaternityDresses(dressIds, !!checked)
                    }}
                  className=''
                  />
                </TableHead>
              <TableHead className='font-semibold'>Đầm Bầu</TableHead>
              <TableHead className='font-semibold'>Mô Tả</TableHead>
              <TableHead className='font-semibold'>Giá</TableHead>
              <TableHead className='font-semibold'>Trạng Thái</TableHead>
              <TableHead className='font-semibold'>Ngày Tạo</TableHead>
                <TableHead className='w-12 pr-6'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-16'>
                  <div className='text-sm text-muted-foreground'>Đang tải dữ liệu...</div>
                  </TableCell>
                </TableRow>
              ) : maternityDresses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-16'>
                  <div className='text-center space-y-3'>
                    <div className='mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center'>
                      <Package2 className='h-6 w-6 text-muted-foreground' />
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {filters.search ? 'Không tìm thấy đầm bầu phù hợp' : 'Chưa có đầm bầu nào'}
                    </div>
                    <Button onClick={() => setCreateMaternityDressDialogOpen(true)} size='sm'>
                      <Plus className='h-4 w-4 mr-2' />Tạo đầm bầu
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
                    className='cursor-pointer group'
                      onClick={() => toggleMaternityDressExpansion(dress.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()} className='pl-6'>
                        <div className='flex items-center justify-center p-1'>
                          {expandedMaternityDressId === dress.id ? (
                            <ChevronDown className='h-4 w-4 text-muted-foreground' />
                          ) : (
                            <ChevronRight className='h-4 w-4 text-muted-foreground' />
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMaternityDresses.includes(dress.id)}
                          onCheckedChange={() => selectMaternityDress(dress.id)}
                          className=''
                        />
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-4'>
                          {dress.images && dress.images.length > 0 ? (
                            <ProductImage src={dress.images[0]} alt={dress.name} />
                          ) : (
                            <div className='w-14 h-14 rounded-xl bg-muted flex items-center justify-center border'>
                              <Package2 className='h-7 w-7 text-muted-foreground' />
                            </div>
                          )}
                          <div className='space-y-1'>
                            <div className='font-medium text-foreground'>
                              {dress.name}
                            </div>
                            <div className='flex items-center gap-2 text-sm'>
                              <Badge variant='secondary' className=''>
                                {dress.styleName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-xs'>
                          <p className='text-muted-foreground line-clamp-2 text-sm leading-relaxed' title={dress.description}>
                            {dress.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-1'>
                          <span className='font-semibold text-sm'>
                            {formatCurrency(calculateTotalPrice(dress.price))}
                          </span>
                          <span className='text-xs text-gray-500'>Giá cơ bản</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {getStatusBadge('Complete')}
                          <div className='w-2 h-2 rounded-full bg-emerald-500'></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <Calendar className='h-4 w-4' />
                          <span>{dayjs(dress.createdAt).format('DD/MM/YYYY')}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className='pr-6'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-9 w-9 p-0'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-48'>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDress(dress.id)}
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
                            className='bg-muted/20'
                          >
                            <TableCell colSpan={8} className='p-0'>
                              <div className='border-t'>
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='border-t'>
            <div className='flex items-center justify-between px-6 py-4 text-sm text-muted-foreground'>
              <div>
                Hiển thị {(pagination.pageNumber - 1) * pagination.pageSize + 1} -
                {` ${Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} trong tổng số ${pagination.totalCount}`}
              </div>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' onClick={() => handlePageChange(pagination.pageNumber - 1)} disabled={!pagination.hasPreviousPage}>
                  Trước
                </Button>
                <Button variant='outline' size='sm' onClick={() => handlePageChange(pagination.pageNumber + 1)} disabled={!pagination.hasNextPage}>
                  Sau
                </Button>
              </div>
            </div>
          </div>
        )}
        </Card>
      {/* Footer quick stats */}
      <Card className='border-0'>
        <CardContent className='p-4 text-sm text-muted-foreground flex flex-wrap items-center gap-4'>
          <span>Hiển thị {filteredDresses.length} đầm bầu</span>
          <span>•</span>
          <span>Tổng giá trị: {formatCurrency(totalValue)}</span>
          {selectedMaternityDresses.length > 0 && (
            <>
              <span>•</span>
              <span>Đã chọn {selectedMaternityDresses.length}</span>
              <Button variant='ghost' size='sm' onClick={clearSelection} className='h-8'>Bỏ chọn</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <MaternityDressCreationDialog open={isCreateMaternityDressDialogOpen} onOpenChange={setCreateMaternityDressDialogOpen} />
    </Main>
  )
}
