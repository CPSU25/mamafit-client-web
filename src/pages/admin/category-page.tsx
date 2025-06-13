import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Package, AlertCircle, Search, MoreHorizontal, ChevronLeft, ChevronRight, RotateCcw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import CategoryFormDialog from '@/components/admin/category-form-dialog'
import DeleteConfirmationDialog from '@/components/admin/delete-confirmation-dialog'
import { CategoryType, CategoryFormData, StyleFormData, StyleType } from '@/@types/inventory.type'
import { useCategoryStore } from '@/stores/category.store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

// React Query Hooks
import { 
  useCategories, 
  useStylesByCategory, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory, 
  useCreateStyle 
} from '@/services/catogories/useCategories'

// Component để hiển thị styles của category
function CategoryStylesSection({ categoryId }: { categoryId: string }) {
  const { expandedCategoryId } = useCategoryStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<StyleFormData>({
    categoryId: categoryId,
    name: '',
    isCustom: false,
    description: '',
    images: []
  })

  // React Query hooks
  const { data: stylesData, isLoading: stylesLoading, error: stylesError } = useStylesByCategory(
    categoryId, 
    {
      index: 1,
      pageSize: 10,
      sortBy: 'createdat_desc'
    }
  )

  const createStyleMutation = useCreateStyle()

  const handleSubmitStyle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    
    try {
      await createStyleMutation.mutateAsync(formData)
      // Reset form
      setFormData({
        categoryId: categoryId,
        name: '',
        isCustom: false,
        description: '',
        images: []
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error creating style:', error)
    }
  }

  if (expandedCategoryId !== categoryId) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground">Đang tải thông tin style...</p>
        </div>
      </div>
    )
  }

  const styles = stylesData?.data.items || []
  const pagination = stylesData?.data
  const totalStyles = pagination?.totalCount || 0
  const hasImages = styles.filter((s: StyleType) => s.image && s.image.length > 0).length

  return (
    <div className="bg-gradient-to-br from-blue-50/30 to-indigo-50/30 border-t border-blue-100">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Chi Tiết Styles Theo Danh Mục</h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Tổng: <span className="font-semibold text-blue-600">{totalStyles} styles</span></span>
                <span>•</span>
                <span>Có hình ảnh: <span className="font-semibold text-green-600">{hasImages}</span></span>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Chi tiết danh mục
            </Badge>
          </div>
        </div>

        {/* Error handling */}
        {stylesError && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {stylesError instanceof Error ? stylesError.message : 'Có lỗi xảy ra khi tải styles'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Styles Content */}
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Danh Sách Styles ({totalStyles})
              </div>
              <Button
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAddForm ? 'Đóng Form' : 'Thêm Style'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Add Style Form */}
            {showAddForm && (
              <div className="mb-6 p-4 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">Thêm Style Mới</h4>
                <form onSubmit={handleSubmitStyle} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên Style *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nhập tên style..."
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="isCustom"
                        checked={formData.isCustom}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isCustom: checked as boolean }))
                        }
                      />
                      <label 
                        htmlFor="isCustom" 
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Style tùy chỉnh
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả về style..."
                      rows={3}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!formData.name.trim() || createStyleMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {createStyleMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Tạo Style
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {stylesLoading ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-muted-foreground">Đang tải styles...</p>
                </div>
              </div>
            ) : styles.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có style nào</h3>
                <p className="text-gray-500">
                  Danh mục này chưa có style nào được tạo
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {styles.map((style) => (
                  <Card key={style.id} className="relative group hover:shadow-lg transition-shadow border border-gray-200">
                    <CardContent className="p-0">
                      {style.image && style.image.length > 0 ? (
                        <CategoryImage 
                          src={style.image[0]} 
                          alt={style.name} 
                          count={style.image.length}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 text-lg">{style.name}</h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">ID:</span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {style.id.slice(-8)}
                            </Badge>
                          </div>
                          {style.image && style.image.length > 1 && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Hình ảnh:</span>
                              <Badge variant="secondary" className="text-xs">
                                {style.image.length} ảnh
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {style.description && (
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600 line-clamp-2">{style.description}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component riêng để xử lý hình ảnh tránh vòng lặp
function CategoryImage({ src, alt, count }: { src: string; alt: string; count: number }) {
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
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
        {count > 1 && (
          <Badge variant="secondary" className="text-xs">
            +{count - 1}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <img
        src={imgSrc}
        alt={alt}
        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-100"
        onError={handleError}
      />
      {count > 1 && (
        <Badge variant="secondary" className="text-xs">
          +{count - 1}
        </Badge>
      )}
    </div>
  )
}

export default function CategoryPage() {
  const {
    selectedCategory,
    filters,
    expandedCategoryId,
    isFormDialogOpen,
    isDeleteDialogOpen,
    setSelectedCategory,
    toggleCategoryExpansion,
    updateFilters,
    resetFilters,
    setFormDialogOpen,
    setDeleteDialogOpen
  } = useCategoryStore()

  const [categoryToDelete, setCategoryToDelete] = useState<CategoryType | null>(null)
  const [localSearch, setLocalSearch] = useState(filters.search)

  // React Query hooks
  const { 
    data: categoriesData, 
    isLoading, 
    error,
    refetch
  } = useCategories({
    index: filters.currentPage,
    pageSize: filters.pageSize,
    search: filters.search || undefined,
    sortBy: filters.sortBy
  })

  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const categories = categoriesData?.data.items || []
  const pagination = categoriesData?.data

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (localSearch !== filters.search) {
        updateFilters({ search: localSearch, currentPage: 1 })
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [localSearch, filters.search, updateFilters])

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setFormDialogOpen(true)
  }

  const handleEditCategory = (category: CategoryType) => {
    setSelectedCategory(category)
    setFormDialogOpen(true)
  }

  const handleDeleteCategory = (category: CategoryType) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
    if (selectedCategory) {
        await updateCategoryMutation.mutateAsync({ id: selectedCategory.id, data })
    } else {
        await createCategoryMutation.mutateAsync(data)
      }
      setFormDialogOpen(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryToDelete.id)
      setCategoryToDelete(null)
        setDeleteDialogOpen(false)
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const handlePageChange = (newPage: number) => {
    updateFilters({ currentPage: newPage })
  }

  const handlePageSizeChange = (newPageSize: string) => {
    updateFilters({ pageSize: parseInt(newPageSize), currentPage: 1 })
  }

  const handleSortChange = (newSort: string) => {
    updateFilters({ sortBy: newSort, currentPage: 1 })
  }

  const handleResetFilters = () => {
    setLocalSearch('')
    resetFilters()
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản Lý Danh Mục</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý các danh mục sản phẩm đầm bầu
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleAddCategory}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm Danh Mục
        </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
                <p className="text-2xl font-bold text-gray-900">{pagination?.totalCount || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Trang hiện tại</p>
                <p className="text-2xl font-bold text-green-600">{pagination?.pageNumber || 1}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">📄</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Có hình ảnh</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(categories || []).filter(c => c.images && c.images.length > 0).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">📷</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng trang</p>
                <p className="text-2xl font-bold text-orange-600">{pagination?.totalPages || 1}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {error instanceof Error ? error.message : 'Có lỗi xảy ra khi tải dữ liệu'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-[130px] border-gray-300">
                  <SelectValue placeholder="Số lượng" />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="border-gray-300 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Danh Sách Danh Mục
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có danh mục nào</h3>
              <p className="text-gray-500 mb-4">
                {filters.search ? 'Không tìm thấy danh mục phù hợp với từ khóa tìm kiếm' : 'Chưa có danh mục nào được tạo'}
              </p>
              <Button onClick={handleAddCategory} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Tạo danh mục đầu tiên
              </Button>
            </div>
          ) : (
            <>
          <Table>
            <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="font-semibold text-gray-900">Tên Danh Mục</TableHead>
                    <TableHead className="font-semibold text-gray-900">Mô Tả</TableHead>
                    <TableHead className="font-semibold text-gray-900">Hình Ảnh</TableHead>
                    <TableHead className="font-semibold text-gray-900">Ngày Tạo</TableHead>
                    <TableHead className="font-semibold text-gray-900 text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {categories.map((category) => (
                    <>
                      <TableRow 
                        key={category.id} 
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="p-1 h-8 w-8"
                          >
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform ${
                                expandedCategoryId === category.id ? 'rotate-180' : ''
                              }`} 
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">
                          {category.name}
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-xs">
                          <div className="truncate" title={category.description}>
                            {category.description || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {category.images && category.images.length > 0 ? (
                            <CategoryImage 
                              src={category.images[0]} 
                              alt={category.name} 
                              count={category.images.length}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(category.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCategory(category)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Content - Styles */}
                      {expandedCategoryId === category.id && (
                <TableRow>
                          <TableCell colSpan={6} className="p-0">
                            <CategoryStylesSection categoryId={category.id} />
                  </TableCell>
                </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                      Hiển thị {((pagination.pageNumber - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} 
                      trong tổng số {pagination.totalCount} danh mục
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.pageNumber - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className="border-gray-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Trước
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = pagination.pageNumber <= 3 
                          ? i + 1 
                          : pagination.pageNumber >= pagination.totalPages - 2
                          ? pagination.totalPages - 4 + i
                          : pagination.pageNumber - 2 + i
                        
                        if (pageNum < 1 || pageNum > pagination.totalPages) return null
                        
                        return (
                        <Button
                            key={pageNum}
                            variant={pageNum === pagination.pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={pageNum === pagination.pageNumber ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300"}
                          >
                            {pageNum}
                        </Button>
                        )
                      })}
                    </div>
                    
                        <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.pageNumber + 1)}
                      disabled={!pagination.hasNextPage}
                      className="border-gray-300"
                    >
                      Sau
                      <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CategoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={setFormDialogOpen}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
        isSubmitting={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Xóa Danh Mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete?.name}"? Hành động này không thể hoàn tác.`}
        isLoading={deleteCategoryMutation.isPending}
      />
    </div>
  )
}
