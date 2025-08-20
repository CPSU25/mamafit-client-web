import { Shield } from 'lucide-react'
import { OrderSearchSection } from './components/OrderSearchSection'
import { ProductSelectionSidebar } from './components/ProductSelectionSidebar'
import { WarrantyRequestsList } from './components/WarrantyRequestsList'
import { WarrantyDashboardHeader } from './components/WarrantyDashboardHeader'
import { SimpleOrderSearchProvider } from './contexts/OrderSearchContextSimple'

// Main page component for branch warranty management
function BranchManageWarrantyContent() {
  return (
    <SimpleOrderSearchProvider>
      <div className='container mx-auto py-6 space-y-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Shield className='h-6 w-6' />
              <h1 className='text-2xl font-bold tracking-tight'>Quản lý bảo hành</h1>
            </div>
            <p className='text-muted-foreground'>Tạo và theo dõi các yêu cầu bảo hành tại chi nhánh</p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <WarrantyDashboardHeader />

        {/* Main Content Grid */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          {/* Order Search Section */}
          <div className='xl:col-span-2 space-y-6'>
            <OrderSearchSection />
            {/* Warranty Requests List - Horizontal Layout */}
            <WarrantyRequestsList />
          </div>

          {/* Product Selection Sidebar */}
          <div className='xl:col-span-1'>
            <ProductSelectionSidebar />
          </div>
        </div>
      </div>
    </SimpleOrderSearchProvider>
  )
}

export default function ManageBranchWarrantyPage() {
  return <BranchManageWarrantyContent />
}
