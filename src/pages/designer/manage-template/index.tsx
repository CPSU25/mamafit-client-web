import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

import {
  PageHeader,
  StatsCards,
  TemplateFilters,
  StyleGrid,
  PresetDetailView
} from '@/pages/designer/manage-template/components'

import { useTemplateManager } from '@/hooks/use-template-manager'
import { useTemplates } from '@/services/designer/template.service'
import { ViewMode, SortBy, FilterBy } from '@/@types/designer.types'

export default function ManageTemplatePage() {
  const [searchParams] = useSearchParams()
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null)

  // Lấy params từ URL để truyền vào hook
  const page = parseInt(searchParams.get('page') || '1')
  const searchTerm = searchParams.get('search') || ''
  const sortBy = (searchParams.get('sortBy') as SortBy) || 'CREATED_AT_DESC'
  const filterBy = (searchParams.get('filterBy') as FilterBy) || 'all'
  const viewMode = (searchParams.get('viewMode') as ViewMode) || 'grid'

  // Fetch dữ liệu từ API - chỉ cần pagination
  const { data, error } = useTemplates({
    index: page,
    pageSize: 12
  })

  // Sử dụng hook quản lý template với dữ liệu từ API
  // Search và sort sẽ được xử lý ở client-side
  const templateManager = useTemplateManager({
    initialTemplates: data?.items || [],
    initialSearchTerm: searchTerm,
    initialViewMode: viewMode,
    initialSortBy: sortBy,
    initialFilterBy: filterBy
  })

  const groupedByStyle = templateManager.groupedByStyle
  const stats = templateManager.stats

  const handleEdit = (id: string) => {
    console.log('Edit template:', id)
  }

  const handleDelete = (id: string) => {
    console.log('Delete template:', id)
  }

  const handleViewPreset = (id: string) => {
    console.log('handleViewPreset called with id:', id)
    setSelectedPresetId(id)
  }

  const handleBackToList = () => {
    console.log('handleBackToList called')
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
    <div className='space-y-6'>
      <div className='max-w-[1600px] mx-auto p-6 space-y-6'>
        <PageHeader
          onCreateTemplate={() => console.log('Create template')}
          onImport={() => console.log('Import')}
          onExport={() => console.log('Export')}
          onSettings={() => console.log('Settings')}
        />

        <StatsCards stats={stats} />

        <TemplateFilters
          searchTerm={templateManager.searchTerm}
          onSearchChange={templateManager.setSearchTerm}
          viewMode={templateManager.viewMode}
          onViewModeChange={templateManager.setViewMode}
          sortBy={templateManager.sortBy}
          onSortChange={templateManager.setSortBy}
          filterBy={templateManager.filterBy}
          onFilterChange={templateManager.setFilterBy}
          totalResults={Object.values(groupedByStyle).reduce((acc, group) => acc + group.templates.length, 0)}
        />

        {/* Main Content Area */}
        <div className='relative'>
          {/* Template Grid - Full width khi không có detail view */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              selectedPresetId ? 'grid grid-cols-1 xl:grid-cols-5 gap-6' : 'w-full'
            }`}
          >
            {/* Template List Area */}
            <div className={`${selectedPresetId ? 'xl:col-span-3 transition-all duration-500' : 'w-full'}`}>
              <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
                <div className='p-6 border-b border-gray-100'>
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold text-gray-900'>
                      Templates ({Object.values(groupedByStyle).reduce((acc, group) => acc + group.templates.length, 0)}
                      )
                    </h2>
                    {selectedPresetId && <div className='text-sm text-gray-500'>Đã chọn preset để xem chi tiết →</div>}
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

            {/* Detail View Sidebar - Slide in from right */}
            {selectedPresetId && (
              <div className='xl:col-span-2'>
                <div className='sticky top-6'>
                  <div className='bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-500 ease-out animate-in slide-in-from-right-5'>
                    {/* Header with gradient */}
                    <div className='bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-lg font-semibold'>Chi tiết Preset</h3>
                          <p className='text-blue-100 text-sm mt-1'>Thông tin đầy đủ về preset</p>
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

                    {/* Content with custom scrollbar */}
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
      </div>
    </div>
  )
}
