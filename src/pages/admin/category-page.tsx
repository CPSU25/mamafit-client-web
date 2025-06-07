import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import CategoryFormDialog from '@/components/admin/category-form-dialog'
import DeleteConfirmationDialog from '@/components/admin/delete-confirmation-dialog'
import { Category, CategoryFormData } from '@/@types/admin.types'

// Mock data
const initialCategories: Category[] = [
  { id: '1', name: 'Casual Dresses', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Formal Wear', createdAt: new Date('2024-01-10') },
  { id: '3', name: 'Office Wear', createdAt: new Date('2024-01-05') },
  { id: '4', name: 'Party Dresses', createdAt: new Date('2024-01-01') }
]

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsFormDialogOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsFormDialogOpen(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (selectedCategory) {
      // Update existing category
      setCategories((prev) =>
        prev.map((cat) => (cat.id === selectedCategory.id ? { ...cat, name: data.name, updatedAt: new Date() } : cat))
      )
    } else {
      // Add new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: data.name,
        createdAt: new Date()
      }
      setCategories((prev) => [newCategory, ...prev])
    }
  }

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id))
      setCategoryToDelete(null)
    }
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Category Management</h1>
          <p className='text-muted-foreground'>Manage product categories for maternity dresses</p>
        </div>
        <Button onClick={handleAddCategory} className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>A list of all product categories in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-8 text-muted-foreground'>
                    No categories found. Add your first category to get started.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className='font-medium'>{category.id}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.createdAt?.toLocaleDateString()}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditCategory(category)}
                          className='flex items-center gap-1'
                        >
                          <Edit className='h-3 w-3' />
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteCategory(category)}
                          className='flex items-center gap-1 text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-3 w-3' />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        category={selectedCategory}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title='Delete Category'
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
