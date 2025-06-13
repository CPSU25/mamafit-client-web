import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Trash,
  ChevronDown,
  ChevronRight,
  Package2,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'

import MaternityDressCreationDialog from '@/components/admin/maternitydress-creation-dialog'
import ExpandedProductDetails from '@/components/admin/expanded-product-details'
import { useMaternityDressStore } from '@/stores/maternity-dress-store'

// React Query Hooks
import { useGetMaternityDresses, useDeleteMaternityDress } from '@/services/maternity-dress/useMaternityDress'

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
      <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
        <Package2 className='h-6 w-6 text-gray-400' />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className='w-12 h-12 rounded-lg object-cover border-2 border-gray-100'
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
    selectMaternityDress,
    selectAllMaternityDresses,
    clearSelection,
    setSearchTerm,
    toggleMaternityDressExpansion,
    setCreateMaternityDressDialogOpen
  } = useMaternityDressStore()

  // Local UI state
  const [showFilters, setShowFilters] = useState(false)

  // React Query hooks
  const {
    data: maternityDressesData,
    isLoading,
    error
  } = useGetMaternityDresses({
    index: 1,
    pageSize: 100,
    search: searchTerm || undefined,
    ...filters
  })

  const deleteMaternityDressMutation = useDeleteMaternityDress()

  const maternityDresses = maternityDressesData?.data.items || []

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

  // Calculate stats from filtered dresses
  const totalDresses = filteredDresses.length
  const incompleteDresses = 0 // Mock data - will be implemented when status field is available
  const completeDresses = totalDresses // Mock data - will be implemented when status field is available
  const totalValue = 0 // Mock data - will be implemented when price field is available

  const handleDeleteDress = async (dressId: string) => {
    try {
      await deleteMaternityDressMutation.mutateAsync(dressId)
    } catch (error) {
      console.error('Error deleting dress:', error)
    }
  }

  return (
    <div className='space-y-6 p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900'>Quản Lý Đầm Bầu</h1>
          <p className='text-muted-foreground mt-1'>Quản lý các mẫu đầm bầu và thông tin chi tiết</p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            onClick={() => setCreateMaternityDressDialogOpen(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          >
            <Plus className='h-4 w-4 mr-2' />
            Tạo Đầm Bầu Mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Tổng đầm bầu</p>
                <p className='text-2xl font-bold text-gray-900'>{totalDresses}</p>
              </div>
              <Package2 className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Chưa hoàn thành</p>
                <p className='text-2xl font-bold text-orange-600'>{incompleteDresses}</p>
              </div>
              <AlertCircle className='h-8 w-8 text-orange-600' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Đã hoàn thành</p>
                <p className='text-2xl font-bold text-green-600'>{completeDresses}</p>
              </div>
              <TrendingUp className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card className='border-0 shadow-sm'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600'>Tổng giá trị</p>
                <p className='text-2xl font-bold text-purple-600'>${totalValue.toLocaleString()}</p>
              </div>
              <div className='h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center'>
                <span className='text-purple-600 font-bold text-sm'>$</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <div className='flex items-center gap-2 text-red-700'>
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
        <CardContent className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
              <Input
                placeholder='Tìm kiếm đầm bầu, mô tả...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500'
              />
            </div>
            <Button
              variant='outline'
              onClick={() => setShowFilters(!showFilters)}
              className='border-gray-200 hover:bg-gray-50'
            >
              <Filter className='h-4 w-4 mr-2' />
              Bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMaternityDresses.length > 0 && (
        <Card className='border-l-4 border-l-blue-500 bg-blue-50 border-blue-200'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-blue-800'>
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
      <Card className='border-0 shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50/50'>
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
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    <p className='text-muted-foreground'>Đang tải...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className='text-center py-12'>
                  <div className='text-muted-foreground'>
                    <Package2 className='h-12 w-12 mx-auto mb-4 opacity-50' />
                    <p className='text-lg font-medium mb-2'>Không tìm thấy đầm bầu</p>
                    <p className='text-sm'>Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDresses
                .map((dress) => [
                  /* Main Dress Row */
                  <TableRow
                    key={`dress-${dress.id}`}
                    className='hover:bg-blue-50/50 cursor-pointer transition-colors border-b border-gray-100'
                    onClick={() => toggleMaternityDressExpansion(dress.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className='flex items-center justify-center'>
                        {expandedMaternityDressId === dress.id ? (
                          <ChevronDown className='h-4 w-4 text-blue-600' />
                        ) : (
                          <ChevronRight className='h-4 w-4 text-gray-400' />
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
                          <div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
                            <Package2 className='h-6 w-6 text-gray-400' />
                          </div>
                        )}
                        <div>
                          <div className='font-semibold text-gray-900'>{dress.name}</div>
                          <div className='text-sm text-gray-500'>ID: {dress.styleName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='max-w-xs truncate' title={dress.description}>
                        {dress.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='font-semibold'>N/A</span>
                    </TableCell>
                    <TableCell>{getStatusBadge('Complete')}</TableCell>
                    <TableCell>
                      <span className='text-sm text-gray-500'>N/A</span>
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
                            className='text-red-600 focus:text-red-600'
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
                          <TableCell colSpan={8} className='p-0 bg-white'>
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
      </Card>

      {/* Footer Stats */}
      <Card className='border-0 shadow-sm'>
        <CardContent className='p-4'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-4'>
              <span>Hiển thị {filteredDresses.length} đầm bầu</span>
              {selectedMaternityDresses.length > 0 && (
                <span className='text-blue-600 font-medium'>• Đã chọn {selectedMaternityDresses.length} đầm bầu</span>
              )}
            </div>
            {selectedMaternityDresses.length > 0 && (
              <Button variant='ghost' size='sm' onClick={clearSelection} className='h-8'>
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
  )
}
