import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAddOn } from '../context/add-on-context'
import { addOnTabs, AddOnTabType } from '../data/data'
import { Package, MapPin, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils/utils'

interface AddOnTabsProps {
  addOnTable: React.ReactNode
  positionTable: React.ReactNode
  sizeTable: React.ReactNode
}

export function AddOnTabs({ addOnTable, positionTable, sizeTable }: AddOnTabsProps) {
  const { activeTab, setActiveTab } = useAddOn()

  const getTabIcon = (value: string) => {
    switch (value) {
      case 'add-ons':
        return Package
      case 'positions':
        return MapPin
      case 'sizes':
        return Ruler
      default:
        return Package
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AddOnTabType)} className='space-y-6'>
      <TabsList className='grid w-full max-w-md grid-cols-3 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800 rounded-xl p-1'>
        {addOnTabs.map((tab) => {
          const IconComponent = getTabIcon(tab.value)
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex items-center gap-2 rounded-lg transition-all duration-200',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600',
                'data-[state=active]:text-white data-[state=active]:shadow-md'
              )}
            >
              <IconComponent className='h-4 w-4' />
              <span className='font-semibold'>{tab.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      <TabsContent value='add-ons' className='space-y-6 mt-6'>
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
              <Package className='h-5 w-5 text-blue-600' />
            </div>
            <h2 className='text-xl font-semibold text-blue-700 dark:text-blue-300'>Add-ons</h2>
          </div>
          <div className='bg-gradient-to-br from-background via-background to-blue-50/30 dark:to-blue-950/10 rounded-lg p-6'>
            {addOnTable}
          </div>
        </div>
      </TabsContent>

      <TabsContent value='positions' className='space-y-6 mt-6'>
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
              <MapPin className='h-5 w-5 text-green-600' />
            </div>
            <h2 className='text-xl font-semibold text-green-700 dark:text-green-300'>Positions</h2>
          </div>
          <div className='bg-gradient-to-br from-background via-background to-green-50/30 dark:to-green-950/10 rounded-lg p-6'>
            {positionTable}
          </div>
        </div>
      </TabsContent>

      <TabsContent value='sizes' className='space-y-6 mt-6'>
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center'>
              <Ruler className='h-5 w-5 text-orange-600' />
            </div>
            <h2 className='text-xl font-semibold text-orange-700 dark:text-orange-300'>Sizes</h2>
          </div>
          <div className='bg-gradient-to-br from-background via-background to-orange-50/30 dark:to-orange-950/10 rounded-lg p-6'>
            {sizeTable}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
