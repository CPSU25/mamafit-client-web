// src/pages/admin/manage-transaction/index.tsx
// Refactored to follow manage-category pattern
import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, TrendingUp, Activity, Sparkles, DollarSign, BarChart3, Package2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from 'recharts'
import { Main } from '@/components/layout/main'
import { DateRange } from 'react-day-picker'
import dayjs from 'dayjs'

// Import pattern components
import { columns } from './components/transaction-columns'
import { TransactionTable } from './components/transaction-table'
import { mockTransactionData, transformTransactionTypeToTransaction } from './data/schema'
import { useTransactions } from '@/services/admin/transaction.service'

// Mock data cho charts (giữ nguyên từ file cũ)
const barSeries = [
  { name: 'Jan', value: 8 },
  { name: 'Feb', value: 6 },
  { name: 'Mar', value: 2 },
  { name: 'Apr', value: 4 },
  { name: 'May', value: 7 },
  { name: 'Jun', value: 9 },
  { name: 'Jul', value: 5 },
  { name: 'Aug', value: 10 }
]

const lineSeries = [
  { name: 'Jan', income: 1200, expense: 250 },
  { name: 'Feb', income: 1100, expense: 300 },
  { name: 'Mar', income: 1400, expense: 280 },
  { name: 'Apr', income: 900, expense: 260 },
  { name: 'May', income: 1000, expense: 290 },
  { name: 'Jun', income: 1300, expense: 310 },
  { name: 'Jul', income: 1500, expense: 320 },
  { name: 'Aug', income: 1600, expense: 330 }
]

function currency(v: number) {
  return v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}

function KpiCard({
  title,
  value,
  delta,
  icon: Icon
}: {
  title: string
  value: string
  delta: string
  icon: React.ElementType
}) {
  return (
    <Card className='border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background hover:shadow-lg transition-all duration-300'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold text-violet-700 dark:text-violet-300'>{value}</p>
            <div className={clsx('text-xs', delta.startsWith('-') ? 'text-rose-600' : 'text-emerald-600')}>{delta}</div>
          </div>
          <div className='h-12 w-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center'>
            <Icon className='h-6 w-6 text-violet-600 dark:text-violet-400' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ManageTransactionPage() {
  const [queryParams, setQueryParams] = useState({
    // API expects index starting at 1 per docs screenshot
    index: 1,
    pageSize: 10
  })

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const newParams = {
      ...queryParams,
      startDate: range?.from ? dayjs(range.from).toDate().toISOString() : undefined,
      endDate: range?.to ? dayjs(range.to).toDate().toISOString() : undefined
    }

    Object.keys(newParams).forEach((key) => {
      if (newParams[key as keyof typeof newParams] === undefined) {
        delete newParams[key as keyof typeof newParams]
      }
    })

    setQueryParams(newParams)
  }

  const { data: apiResponse, isLoading, error } = useTransactions(queryParams)

  const transactionList = apiResponse?.data?.items
    ? apiResponse.data.items.map(transformTransactionTypeToTransaction)
    : mockTransactionData

  const totalTransactions = transactionList.length
  const successfulTransactions = transactionList.filter((t) => t.transferAmount > 0).length
  const utilizationRate = totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0

  const totals = useMemo(() => {
    const income = transactionList.reduce((sum, t) => sum + t.transferAmount, 0)
    const expense = 3134500
    const returnCost = 134000
    const shippingCost = 3000000
    return { income, expense, returnCost, shippingCost }
  }, [transactionList])

  if (isLoading) {
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <div className='text-center space-y-4'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-violet-200 border-t-violet-600 mx-auto'></div>
              <CreditCard className='h-8 w-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' />
            </div>
            <div>
              <p className='text-lg font-medium text-foreground'>Đang tải giao dịch...</p>
              <p className='text-sm text-muted-foreground mt-1'>Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
    return (
      <Main>
        <div className='flex items-center justify-center h-[calc(100vh-200px)]'>
          <Card className='max-w-md w-full border-destructive/20 bg-destructive/5'>
            <CardContent className='pt-6'>
              <div className='text-center space-y-4'>
                <div className='h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                  <Package2 className='h-8 w-8 text-destructive' />
                </div>
                <div>
                  <p className='text-lg font-semibold text-destructive'>Không thể tải giao dịch</p>
                  <p className='text-sm text-muted-foreground mt-2'>{errorMessage}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className='px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors'
                >
                  Thử lại
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  return (
    <Main className='space-y-6'>
      <div className='space-y-6'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg'>
                <CreditCard className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent'>
                  Quản Lý Giao Dịch
                </h1>
                <p className='text-sm text-muted-foreground flex items-center gap-1'>
                  Theo dõi và quản lý tất cả giao dịch thanh toán
                  <Sparkles className='h-3 w-3 text-violet-500' />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='grid gap-4 md:grid-cols-4'>
          <KpiCard title='Tổng giao dịch' value={totalTransactions.toString()} delta='+2.75%' icon={BarChart3} />
          <KpiCard title='Doanh thu' value={currency(totals.income)} delta='+2.75%' icon={DollarSign} />
          <KpiCard title='Chi phí' value={currency(totals.expense)} delta='+1.50%' icon={TrendingUp} />
          <KpiCard title='Tỷ lệ thành công' value={`${utilizationRate}%`} delta='-2.65%' icon={Activity} />
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-1 border-violet-200 dark:border-violet-800'>
          <CardHeader>
            <CardTitle className='text-violet-700 dark:text-violet-300'>Tổng quan</CardTitle>
            <p className='text-xs text-muted-foreground'>Số tiền đơn hàng mở</p>
            <div className='text-2xl font-semibold mt-1'>{currency(2501000)}</div>
            <p className='text-xs text-muted-foreground'>{currency(1500500)} đã nhận • 65% đơn trả trước</p>
          </CardHeader>
          <CardContent>
            <div className='h-52'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={barSeries}>
                  <CartesianGrid vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey='name' tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey='value' radius={[6, 6, 0, 0]} fill='#8b5cf6' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue generated line */}
        <Card className='lg:col-span-2 border-violet-200 dark:border-violet-800'>
          <CardHeader className='flex-row items-center justify-between space-y-0'>
            <CardTitle className='text-violet-700 dark:text-violet-300'>Doanh thu tạo ra</CardTitle>
            <div className='flex items-baseline gap-6'>
              <div>
                <div className='text-xs text-muted-foreground'>Thu nhập</div>
                <div className='text-xl font-semibold'>{currency(totals.income)}</div>
              </div>
              <div>
                <div className='text-xs text-muted-foreground'>Chi phí</div>
                <div className='text-xl font-semibold'>{currency(totals.expense)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-52'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={lineSeries}>
                  <CartesianGrid strokeOpacity={0.1} />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Line type='monotone' dataKey='income' strokeWidth={2} stroke='#8b5cf6' />
                  <Line type='monotone' dataKey='expense' strokeWidth={2} stroke='#ef4444' />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section with Enhanced Styling */}
      <Card className='border-0 shadow-xl bg-gradient-to-br from-background via-background to-violet-50/30 dark:to-violet-950/10'>
        <CardHeader className='flex-row items-center justify-between space-y-0 p-6'>
          <CardTitle className='text-violet-700 dark:text-violet-300 flex items-center gap-2'>
            <CreditCard className='h-5 w-5' />
            Danh Sách Giao Dịch
          </CardTitle>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='p-6 space-y-4'>
            <TransactionTable data={transactionList} columns={columns} onDateRangeChange={handleDateRangeChange} />
          </div>
        </CardContent>
      </Card>
    </Main>
  )
}
