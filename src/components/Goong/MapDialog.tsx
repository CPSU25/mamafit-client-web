import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { MapPin, Video } from 'lucide-react'
import { useState } from 'react'
import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from 'src/components/ui/dialog'
import { useSearchLocation } from '@/services/maps/useSearchLocation'
import { useDebounce } from 'use-debounce'
import { Input } from '../ui/input'
import { ScrollArea } from '../ui/scroll-area'

interface LocationDialog<T> {
  trigger: React.ReactNode
  asChild?: boolean
  name: Path<T>
}

const MapDialog = <T extends FieldValues>({ trigger, name, asChild = true }: LocationDialog<T>) => {
  const { setValue } = useFormContext<T>()
  const [open, setOpen] = useState(false)
  const [locationName, setLocationName] = useState('')
  const [debouncedLocation] = useDebounce(locationName, 300)

  const { data: locations } = useSearchLocation(debouncedLocation)

  const handleSelectLocation = (placeId: string) => {
    if (!placeId) return
    setValue(name, placeId as PathValue<T, Path<T>>)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>{trigger}</DialogTrigger>
      <DialogContent className='[&>button]:hidden'>
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Location</DialogTitle>
            <DialogDescription>Fixed the warning</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <div className='space-y-4'>
          <p className='font-semibold text-xl'>Event Location</p>
          <Input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder='Enter location'
            className='h-10'
            autoFocus
            StartIcon={MapPin}
          />
          <div className='space-y-2'>
            <p className='font-medium text-muted-foreground text-sm'>
              {debouncedLocation ? 'Recent Locations' : 'No Locations Found'}
            </p>
            <ScrollArea className='flex flex-col gap-2 h-48'>
              {locationName &&
                locations?.predictions.map((location) => (
                  <div
                    key={location.place_id}
                    className='p-3 flex items-center gap-3 hover:bg-[#ffffff0c] rounded-lg cursor-pointer'
                    onClick={() => handleSelectLocation(location.place_id)}
                  >
                    <div className='flex flex-col'>
                      <p className='font-medium text-sm'>{location.structured_formatting.main_text}</p>
                      <p className='font-medium text-xs text-muted-foreground'>
                        {location.structured_formatting.secondary_text}
                      </p>
                    </div>
                  </div>
                ))}
            </ScrollArea>
            <div className='space-y-1'>
              <p className='font-medium text-muted-foreground text-sm'>Virtual Options</p>
              <div className='px-3 py-2 flex items-center gap-3 hover:bg-[#ffffff0c] rounded-lg cursor-pointer'>
                <Video size={18} />
                <p className='font-medium text-sm'>Create Zoom meeting</p>
              </div>
              <div className='px-3 py-2 flex items-center gap-3 hover:bg-[#ffffff0c] rounded-lg cursor-pointer'>
                <Video size={18} />
                <p className='font-medium text-sm'>Create Google Meet meeting</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MapDialog
