import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

import {
  PageHeader,
  StatsCards,
  TemplateFilters,
  StyleGrid,
  PresetDetailView,
  CreatePresetModal
} from '@/pages/designer/manage-template/components'

import { useTemplateManager } from '@/hooks/use-template-manager'
import { useTemplates } from '@/services/designer/template.service'
import { ViewMode, SortBy, FilterBy } from '@/@types/designer.types'
import EditPresetModal from '@/pages/designer/manage-template/components/edit-preset-modal'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDeleteTemplate } from '@/services/designer/template.service'
import { Main } from '@/components/layout/main'

export default function ManageTemplatePage() {
  const [searchParams] = useSearchParams()
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editPresetId, setEditPresetId] = useState<string | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const page = parseInt(searchParams.get('page') || '100')
  const searchTerm = searchParams.get('search') || ''
  const sortBy = (searchParams.get('sortBy') as SortBy) || 'CREATED_AT_DESC'
  const filterBy = (searchParams.get('filterBy') as FilterBy) || 'all'
  const viewMode = (searchParams.get('viewMode') as ViewMode) || 'grid'

  const { data, error, refetch } = useTemplates({
    index: 0,
    pageSize: page
  })
  const systemPresets = data?.items.filter((preset) => preset.type === 'SYSTEM') || []
  const templateManager = useTemplateManager({
    initialTemplates: systemPresets || [],
    initialSearchTerm: searchTerm,
    initialViewMode: viewMode,
    initialSortBy: sortBy,
    initialFilterBy: filterBy
  })

  const groupedByStyle = templateManager.groupedByStyle
  const stats = templateManager.stats

  const handleCreateTemplate = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = () => {
    refetch()
  }

  const handleEdit = (id: string) => {
    setEditPresetId(id)
    setIsEditModalOpen(true)
  }

  const deleteMutation = useDeleteTemplate()
  const handleDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }
  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteMutation.mutateAsync(deleteId)
    setIsDeleteOpen(false)
    setDeleteId(null)
    refetch()
  }

  const handleViewPreset = (id: string) => {
    setSelectedPresetId(id)
  }

  const handleBackToList = () => {
    setSelectedPresetId(null)
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <p className='text-red-500 mb-2'>Có lỗi xảy ra khi tải dữ liệu</p>
          <p className='text-sm text-muted-foreground'>
            {error instanceof Error ? error.message : 'Lỗi không xác định'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Main>
      <div className='space-y-6'>
        <PageHeader onCreateTemplate={handleCreateTemplate} />

        <StatsCards stats={stats} />

        <TemplateFilters
          searchTerm={templateManager.searchTerm}
          onSearchChange={templateManager.setSearchTerm}
          sortBy={templateManager.sortBy}
          onSortChange={templateManager.setSortBy}
          filterBy={templateManager.filterBy}
          onFilterChange={templateManager.setFilterBy}
          totalResults={Object.values(groupedByStyle).reduce((acc, group) => acc + group.templates.length, 0)}
        />

        <div className='relative'>
          <div
            className={`transition-all duration-500 ease-in-out ${
              selectedPresetId ? 'grid grid-cols-1 xl:grid-cols-5 gap-6' : 'w-full'
            }`}
          >
            <div className={`${selectedPresetId ? 'xl:col-span-3 transition-all duration-500' : 'w-full'}`}>
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Số lượng mẫu (
                      {Object.values(groupedByStyle).reduce((acc, group) => acc + group.templates.length, 0)})
                    </h2>
                    {selectedPresetId && <div className='text-sm text-gray-500'>Đã chọn mẫu để xem chi tiết →</div>}
                  </div>
                </div>

                <div
                  className={`${
                    selectedPresetId ? 'max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar' : 'max-h-none'
                  }`}
                >
                  <div className='p-6'>
                    <StyleGrid
                      groupedByStyle={groupedByStyle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleViewPreset}
                    />
                  </div>
                </div>
              </div>
            </div>

            {selectedPresetId && (
              <div className='xl:col-span-2'>
                <div className='sticky top-6'>
                  <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-500 ease-out animate-in slide-in-from-right-5'>
                    {/* Header with gradient */}
                    <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-lg font-semibold'>Chi tiết Mẫu</h3>
                          <p className='text-blue-100 text-sm mt-1'>Thông tin đầy đủ về mẫu</p>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleBackToList}
                          className='h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors'
                        >
                          ×
                        </Button>
                      </div>
                    </div>

                    <div className='max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
                      <div className='p-6'>
                        <PresetDetailView
                          presetId={selectedPresetId}
                          onBack={handleBackToList}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          showBackButton={false}
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <CreatePresetModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />

        <EditPresetModal
          open={isEditModalOpen}
          presetId={editPresetId}
          onOpenChange={setIsEditModalOpen}
          onSuccess={() => {
            refetch()
            setEditPresetId(null)
          }}
        />

        <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title='Xác nhận xóa preset'
          description='Bạn có chắc chắn muốn xóa preset này? Hành động này không thể hoàn tác.'
          confirmText='Xóa'
          cancelText='Hủy'
          variant='destructive'
          onConfirm={confirmDelete}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </Main>
  )
}
