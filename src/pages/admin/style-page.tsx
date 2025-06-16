import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import StyleFormDialog from '@/pages/admin/components/style-form-dialog'
import DeleteConfirmationDialog from '@/pages/admin/components/delete-confirmation-dialog'
import { Style, StyleFormData } from '@/@types/admin.types'

// Mock data
const initialStyles: Style[] = [
  { id: '1', name: 'A-Line', createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Maxi', createdAt: new Date('2024-01-10') },
  { id: '3', name: 'Empire Waist', createdAt: new Date('2024-01-05') },
  { id: '4', name: 'Wrap Style', createdAt: new Date('2024-01-01') },
  { id: '5', name: 'Bodycon', createdAt: new Date('2023-12-28') }
]

export default function StylePage() {
  const [styles, setStyles] = useState<Style[]>(initialStyles)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [styleToDelete, setStyleToDelete] = useState<Style | null>(null)

  const handleAddStyle = () => {
    setSelectedStyle(null)
    setIsFormDialogOpen(true)
  }

  const handleEditStyle = (style: Style) => {
    setSelectedStyle(style)
    setIsFormDialogOpen(true)
  }

  const handleDeleteStyle = (style: Style) => {
    setStyleToDelete(style)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: StyleFormData) => {
    if (selectedStyle) {
      // Update existing style
      setStyles((prev) =>
        prev.map((style) =>
          style.id === selectedStyle.id ? { ...style, name: data.name, updatedAt: new Date() } : style
        )
      )
    } else {
      // Add new style
      const newStyle: Style = {
        id: Date.now().toString(),
        name: data.name,
        createdAt: new Date()
      }
      setStyles((prev) => [newStyle, ...prev])
    }
  }

  const confirmDelete = () => {
    if (styleToDelete) {
      setStyles((prev) => prev.filter((style) => style.id !== styleToDelete.id))
      setStyleToDelete(null)
    }
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Style Management</h1>
          <p className='text-muted-foreground'>Manage dress styles for maternity clothing</p>
        </div>
        <Button onClick={handleAddStyle} className='flex items-center gap-2'>
          <Plus className='h-4 w-4' />
          Add Style
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Styles</CardTitle>
          <CardDescription>A list of all dress styles available in the system.</CardDescription>
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
              {styles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='text-center py-8 text-muted-foreground'>
                    No styles found. Add your first style to get started.
                  </TableCell>
                </TableRow>
              ) : (
                styles.map((style) => (
                  <TableRow key={style.id}>
                    <TableCell className='font-medium'>{style.id}</TableCell>
                    <TableCell>{style.name}</TableCell>
                    <TableCell>{style.createdAt?.toLocaleDateString()}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleEditStyle(style)}
                          className='flex items-center gap-1'
                        >
                          <Edit className='h-3 w-3' />
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => handleDeleteStyle(style)}
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

      <StyleFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        style={selectedStyle}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title='Delete Style'
        description={`Are you sure you want to delete "${styleToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
