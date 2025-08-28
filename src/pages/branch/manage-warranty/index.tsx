import { Shield } from 'lucide-react'
import { OrderSearchSection } from './components/OrderSearchSection'
import { ProductSelectionSidebar } from './components/ProductSelectionSidebar'
import { WarrantyRequestsList } from './components/WarrantyRequestsList'
import { WarrantyDashboardHeader } from './components/WarrantyDashboardHeader'
import { SimpleOrderSearchProvider } from './contexts/OrderSearchContextSimple'
import { Main } from '@/components/layout/main'
const BranchManageWarrantyContent = () => {
  return (
    <Main className='space-y-6'>
      <SimpleOrderSearchProvider>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <Shield className='h-6 w-6' />
              <h1 className='text-2xl font-bold tracking-tight'>Quản lý bảo hành</h1>
            </div>
            <p className='text-muted-foreground'>Tạo và theo dõi các yêu cầu bảo hành tại chi nhánh</p>
          </div>
        </div>

        <WarrantyDashboardHeader />

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
          <div className='xl:col-span-2 space-y-6'>
            <OrderSearchSection />
            <WarrantyRequestsList />
          </div>

          <div className='xl:col-span-1'>
            <ProductSelectionSidebar />
          </div>
        </div>
      </SimpleOrderSearchProvider>
    </Main>
  )
}

export default function ManageBranchWarrantyPage() {
  return <BranchManageWarrantyContent />
}
