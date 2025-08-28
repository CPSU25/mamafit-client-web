import { useMemo } from 'react'
import { BranchHeader } from './components/Header'
import { KpiCards } from './components/KpiCards'
import { SalesChartCard } from './components/SalesChartCard'
import { QuickActions } from './components/QuickActions'
import { RecentOrdersCard } from './components/RecentOrdersCard'
import { WarrantyRequestsCard } from './components/WarrantyRequestsCard'
import { TodayAppointmentsCard } from './components/TodayAppointmentsCard'
import type { AppointmentMini, BranchKpis, RecentOrder, WarrantyCard } from './components/types'

export default function BranchDashboard() {
  const kpis: BranchKpis = useMemo(
    () => ({ revenueToday: 12500000, ordersToday: 18, warrantyOpen: 6, appointmentsToday: 9 }),
    []
  )

  const recentOrders: RecentOrder[] = useMemo(
    () => [
      { id: '1', code: 'BR-10231', totalAmount: 2450000, status: 'DELIVERING', createdAt: new Date().toISOString() },
      {
        id: '2',
        code: 'BR-10230',
        totalAmount: 3650000,
        status: 'RECEIVED_AT_BRANCH',
        createdAt: new Date().toISOString()
      },
      { id: '3', code: 'BR-10229', totalAmount: 1590000, status: 'COMPLETED', createdAt: new Date().toISOString() }
    ],
    []
  )

  const recentWarranties: WarrantyCard[] = useMemo(
    () => [
      { id: 'wr-1', sku: 'P000123', status: 'PENDING', createdAt: new Date().toISOString() },
      { id: 'wr-2', sku: 'P000456', status: 'REPAIRING', totalFee: 120000, createdAt: new Date().toISOString() },
      { id: 'wr-3', sku: 'P000789', status: 'APPROVED', createdAt: new Date().toISOString() }
    ],
    []
  )

  const todayAppointments: AppointmentMini[] = useMemo(
    () => [
      { id: 'ap-1', customer: 'Nguyễn Lan', phone: '0901 234 567', time: '09:30', status: 'UP_COMING' },
      { id: 'ap-2', customer: 'Trần Minh', phone: '0933 888 222', time: '11:00', status: 'CHECKED_IN' },
      { id: 'ap-3', customer: 'Lê Hòa', phone: '0987 111 222', time: '15:15', status: 'UP_COMING' }
    ],
    []
  )

  return (
    <div className='space-y-6'>
      <BranchHeader onDateChange={() => {}} />
      <KpiCards kpis={kpis} />

      <div className='grid gap-4 lg:grid-cols-3'>
        <SalesChartCard />
        <QuickActions />
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <RecentOrdersCard orders={recentOrders} />
        <WarrantyRequestsCard items={recentWarranties} />
        <TodayAppointmentsCard items={todayAppointments} />
      </div>
    </div>
  )
}
