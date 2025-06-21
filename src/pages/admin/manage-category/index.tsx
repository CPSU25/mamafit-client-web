import { useState, useMemo, useCallback } from 'react'
import { Main } from '@/components/layout/main'
import { createColumns } from './components/categories-columns'
import { CategoriesTable } from './components/categories-table'
import { useCategories } from '@/services/admin/category.service'
import { Loader2, Package, AlertCircle, RefreshCw, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CategoryType } from '@/@types/inventory.type'
import { CategoryFormDialog } from './components/category-form-dialog'
import { CategoryDeleteDialog } from './components/category-delete-dialog'

type DialogType = 'add' | 'edit' | 'delete' | null

/**
 * Main page component for managing categories
 * Simple and direct approach using API hooks
 */
export default function ManageCategoryPage() {
  // Simple local state management
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null)
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null)
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)

  // Direct API call - simple and effective
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useCategories({
    index: 1,
    pageSize: 10,
    sortBy: 'createdat_desc'
  })

  const categories = categoriesData?.data.items || []

  // Stable action handlers with useCallback
  const openAddDialog = useCallback(() => {
    setCurrentCategory(null)
    setDialogOpen('add')
  }, [])

  const openEditDialog = useCallback((category: CategoryType) => {
    setCurrentCategory(category)
    setDialogOpen('edit')
  }, [])

  const openDeleteDialog = useCallback((category: CategoryType) => {
    setCurrentCategory(category)
    setDialogOpen('delete')
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(null)
    // Clear after delay to allow close animation
    setTimeout(() => {
      setCurrentCategory(null)
    }, 300)
  }, [])

  const handleCategoryClick = useCallback((categoryId: string) => {
    setExpandedCategoryId(prev => prev === categoryId ? null : categoryId)
  }, [])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Safe error message handling
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Lỗi không xác định'
  }

  const errorMessage = error ? getErrorMessage(error) : ''

  // Create columns with callbacks - now with stable references
  const columns = useMemo(
    () => createColumns({
      onEditCategory: openEditDialog,
      onDeleteCategory: openDeleteDialog
    }),
    [openEditDialog, openDeleteDialog]
  )

  return (
    <Main>
      <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Quản Lý Danh Mục</h2>
          <p className='text-muted-foreground'>
            Quản lý các danh mục sản phẩm đầm bầu và styles
          </p>
        </div>
        
        {/* Add Button */}
        <Button
          onClick={openAddDialog}
          className='bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          aria-label='Thêm danh mục mới'
        >
          <Plus className='h-4 w-4 mr-2' aria-hidden="true" />
          Thêm Danh Mục
        </Button>
      </div>
      
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        {/* Loading State */}
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' aria-hidden="true" />
              <p className='text-muted-foreground'>Đang tải danh sách danh mục...</p>
            </div>
          </div>
        ) : null}

        {/* Error State */}
        {error ? (
          <Card className='border-red-200 bg-red-50'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-red-700'>
                  <AlertCircle className='h-4 w-4' aria-hidden="true" />
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>Có lỗi xảy ra khi tải dữ liệu</span>
                    <span className='text-xs opacity-75'>{String(errorMessage)}</span>
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  className='border-red-300 text-red-700 hover:bg-red-100'
                  aria-label='Thử lại tải dữ liệu'
                >
                  {isRefetching ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' aria-hidden="true" />
                  ) : (
                    <RefreshCw className='h-4 w-4 mr-2' aria-hidden="true" />
                  )}
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Empty State */}
        {!isLoading && !error && categories.length === 0 && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <Package className='h-16 w-16 mx-auto mb-4 text-gray-300' aria-hidden="true" />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Chưa có danh mục nào</h3>
              <p className='text-gray-500 mb-4'>Bắt đầu bằng cách tạo danh mục đầu tiên</p>
              <Button
                onClick={openAddDialog}
                className='bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              >
                <Plus className='h-4 w-4 mr-2' aria-hidden="true" />
                Thêm Danh Mục
              </Button>
            </div>
          </div>
        )}

        {/* Success State with Table */}
        {!isLoading && !error && categories.length > 0 && (
          <div className='space-y-4'>
            <CategoriesTable 
              data={categories} 
              columns={columns}
              expandedCategoryId={expandedCategoryId}
              onCategoryClick={handleCategoryClick}
            />
            
            {/* Manual Refresh */}
            <div className='flex justify-end'>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRefresh}
                disabled={isRefetching}
                className='text-xs'
                aria-label='Làm mới dữ liệu'
              >
                {isRefetching ? (
                  <>
                    <Loader2 className='h-3 w-3 mr-1 animate-spin' aria-hidden="true" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <RefreshCw className='h-3 w-3 mr-1' aria-hidden="true" />
                    Làm mới
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CategoryFormDialog 
        open={dialogOpen === 'add'} 
        onOpenChange={(open) => !open && closeDialog()}
        mode="add"
      />

      {currentCategory && (
        <>
          <CategoryFormDialog
            open={dialogOpen === 'edit'}
            onOpenChange={(open) => !open && closeDialog()}
            mode="edit"
            currentCategory={currentCategory}
          />

          <CategoryDeleteDialog
            open={dialogOpen === 'delete'}
            onOpenChange={(open) => !open && closeDialog()}
            currentCategory={currentCategory}
          />
        </>
      )}
    </Main>
  )
} 