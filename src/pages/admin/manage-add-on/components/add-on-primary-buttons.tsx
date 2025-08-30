import { Plus, MapPin, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAddOn } from '../context/add-on-context'
import { cn } from '@/lib/utils/utils'

export function AddOnPrimaryButtons() {
  const { setOpen, activeTab } = useAddOn()

  const getButtonConfig = () => {
    switch (activeTab) {
      case 'add-ons':
        return {
          onClick: () => setOpen('add-add-on'),
          icon: Plus,
          text: 'Thêm Add-on',
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }
      case 'positions':
        return {
          onClick: () => setOpen('add-position'),
          icon: MapPin,
          text: 'Thêm Position',
          className: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
        }
      case 'sizes':
        return {
          onClick: () => setOpen('add-size'),
          icon: Ruler,
          text: 'Thêm Size',
          className: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
        }
      default:
        return {
          onClick: () => setOpen('add-add-on'),
          icon: Plus,
          text: 'Thêm Add-on',
          className: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
        }
    }
  }

  const config = getButtonConfig()
  const IconComponent = config.icon

  return (
    <div className='flex items-center gap-2'>
      <Button
        onClick={config.onClick}
        className={cn(
          'relative overflow-hidden',
          config.className,
          'text-white font-semibold',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300',
          'group'
        )}
      >
        {/* Animated background effect */}
        <span className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Button content */}
        <span className='relative flex items-center gap-2'>
          <IconComponent className='h-4 w-4 group-hover:scale-110 transition-transform duration-300' />
          {config.text}
          {/* Sparkle effect */}
          <span className='absolute -top-1 -right-1 h-2 w-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75'></span>
            <span className='relative inline-flex rounded-full h-2 w-2 bg-white'></span>
          </span>
        </span>
      </Button>
    </div>
  )
}
