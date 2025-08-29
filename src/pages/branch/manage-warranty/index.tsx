import { Shield, Sparkles } from 'lucide-react'
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
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                <Shield className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                  Quản lý bảo hành
                </h1>
                <p className='text-sm text-muted-foreground flex items-center gap-1'>
                  Tạo và theo dõi các yêu cầu bảo hành tại chi nhánh
                  <Sparkles className='h-3 w-3 text-violet-500' />
                </p>
              </div>
            </div>
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
