// index.tsx - Trang Quản Lý Ticket Report
import { useMemo } from 'react'
import { AlertTriangle, MessageSquare, Package, Clock, Bug, Sparkles } from 'lucide-react'

import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useGetTickets } from '@/services/admin/ticket.service'

import { TicketGrid, TicketDetailDialog } from './components'
import { TicketProvider, useTickets as useTicketsContext } from './contexts'

import type { TicketList } from '@/@types/ticket.types'

interface TicketStatisticsProps {
  totalTickets: number
  warrantyTickets: number
  deliveryTickets: number
  otherTickets: number
  isLoading?: boolean
}

function TicketStatistics({
  totalTickets,
  warrantyTickets,
  deliveryTickets,
  otherTickets,
  isLoading = false
}: TicketStatisticsProps) {
  const stats = [
    {
      title: 'Tổng ticket',
      subtitle: 'Số ticket nhận được',
      value: totalTickets,
      icon: MessageSquare,
      iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
      cardBg:
        'border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background'
    },
    {
      title: 'Bảo hành',
      subtitle: 'Ticket bảo hành',
      value: warrantyTickets,
      icon: Package,
      iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      cardBg:
        'border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/30 dark:to-background'
    },
    {
      title: 'Giao hàng',
      subtitle: 'Ticket giao hàng',
      value: deliveryTickets,
      icon: Clock,
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      cardBg:
        'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background'
    },
    {
      title: 'Khác',
      subtitle: 'Ticket khác',
      value: otherTickets,
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
      cardBg:
        'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/30 dark:to-background'
    }
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className='hover:shadow-lg transition-all duration-300'>
            <CardHeader className='pb-2'>
              <div className='h-4 w-24 bg-muted rounded animate-pulse' />
              <div className='h-3 w-32 bg-muted rounded mt-1 animate-pulse' />
            </CardHeader>
            <CardContent>
              <div className='h-7 w-20 bg-muted rounded animate-pulse' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`hover:shadow-lg transition-all duration-300 ${stat.cardBg}`}>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-sm font-medium text-muted-foreground'>{stat.subtitle}</CardTitle>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon className='h-6 w-6' />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className='text-sm font-medium'>{stat.title}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ManageTicketContent() {
  const { data: ticketsData, isLoading, error } = useGetTickets()
  const { selectedTicket, setSelectedTicket } = useTicketsContext()
  const statistics = useMemo(() => {
    const total = ticketsData?.data?.length || 0
    const warranty = ticketsData?.data.filter((t: TicketList) => t.type === 'WARRANTY_SERVICE').length
    const delivery = ticketsData?.data.filter((t: TicketList) => t.type === 'DELIVERY_SERVICE').length
    const other = ticketsData?.data.filter((t: TicketList) => t.type === 'OTHER').length

    return { total, warranty, delivery, other }
  }, [ticketsData])

  const handleTicketSelect = (ticket: TicketList) => {
    setSelectedTicket(ticket)
  }

  const handleCloseSidebar = () => {
    setSelectedTicket(null)
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <div className='flex items-center gap-2'>
          <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
            <Bug className='h-6 w-6 text-white' />
          </div>
          <div>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
              Quản Lý Khiếu Nại
            </h1>
            <p className='text-sm text-muted-foreground flex items-center gap-1'>
              Quản lý các các khiếu nại của khách hàng về sản phẩm
              <Sparkles className='h-3 w-3 text-violet-500' />
            </p>
          </div>
        </div>
      </div>

      <TicketStatistics
        totalTickets={statistics.total}
        warrantyTickets={statistics.warranty || 0}
        deliveryTickets={statistics.delivery || 0}
        otherTickets={statistics.other || 0}
        isLoading={isLoading}
      />

      <TicketGrid
        tickets={ticketsData?.data || []}
        isLoading={isLoading}
        error={error?.message}
        onTicketSelect={handleTicketSelect}
      />

      <TicketDetailDialog ticket={selectedTicket} isOpen={!!selectedTicket} onClose={handleCloseSidebar} />
    </div>
  )
}

// Export component chính
export default function ManageTicketPage() {
  return (
    <TicketProvider>
      <Main>
        <ManageTicketContent />
      </Main>
    </TicketProvider>
  )
}
