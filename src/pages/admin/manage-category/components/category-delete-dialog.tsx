import { useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useDeleteCategory } from '@/services/admin/category.service'
import { toast } from 'sonner'
import { CategoryType } from '@/@types/inventory.type'

interface CategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentCategory: CategoryType
}

export function CategoryDeleteDialog({ 
  open, 
  onOpenChange, 
  currentCategory 
}: CategoryDeleteDialogProps) {
  const deleteCategoryMutation = useDeleteCategory()
  
  // Reset mutation when dialog opens
  useEffect(() => {
    if (open) {
      deleteCategoryMutation.reset()
    }
  }, [open, deleteCategoryMutation])

  const handleDelete = async () => {
    if (!currentCategory) {
      toast.error('Không tìm thấy danh mục để xóa')
      onOpenChange(false)
      return
    }

    try {
      await deleteCategoryMutation.mutateAsync(currentCategory.id)
      
      toast.success('Xóa danh mục thành công!')
      onOpenChange(false)
    } catch (error: unknown) {
      console.error('Error deleting category:', error)
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra'
      
      toast.error(`Lỗi xóa danh mục: ${errorMessage}`)
      
      // Reset mutation state but keep dialog open for retry
      deleteCategoryMutation.reset()
    }
  }

  const handleClose = () => {
    deleteCategoryMutation.reset()
    onOpenChange(false)
  }

  const isDeleting = deleteCategoryMutation.isPending

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
            Xác Nhận Xóa Danh Mục
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Bạn có chắc chắn muốn xóa danh mục{' '}
            <span className="font-semibold text-foreground">
              "{currentCategory?.name}"
            </span>
            ?
            <br />
            <span className="text-red-600 text-sm mt-2 block">
              ⚠️ Hành động này không thể hoàn tác và sẽ xóa tất cả styles liên quan.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleClose}
            disabled={isDeleting}
          >
            Hủy
          </AlertDialogCancel>
          
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              )}
              Xóa Danh Mục
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 