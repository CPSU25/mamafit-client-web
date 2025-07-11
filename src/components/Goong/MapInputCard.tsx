import GoongMap from './GoongMap'
import { MapPin, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form'
import { useGetLocation } from '@/services/maps/useGetLocation'
import { useSearchLocation } from '@/services/maps/useSearchLocation'
import { cn } from '@/lib/utils/utils'
import { useDebounce } from 'use-debounce'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { defaultLocationValues } from '@/services/maps/map-schema'
import { ScrollArea } from '../ui/scroll-area'

interface MapInputCardProps<T> {
  className?: string
  name: Path<T>
  valueName: Path<T>
}

const MapInputCard = <T extends FieldValues>({ className, name, valueName }: MapInputCardProps<T>) => {
  const { setValue, watch } = useFormContext<T>()
  const [locationName, setLocationName] = useState('')
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0])
  const [debouncedLocation] = useDebounce(locationName, 300)

  const { data: locations } = useSearchLocation(debouncedLocation)

  const handleSelectLocation = (placeId: string) => {
    if (!placeId) return
    setValue(valueName, placeId as PathValue<T, Path<T>>)
    setLocationName('')
  }

  const { data: locationDetail } = useGetLocation(watch(valueName))

  useEffect(() => {
    if (locationDetail) {
      const location = {
        id: locationDetail.place_id,
        name: locationDetail.name,
        address: locationDetail.formatted_address,
        lat: locationDetail.geometry.location.lat,
        lng: locationDetail.geometry.location.lng
      }
      setValue(name, location as PathValue<T, Path<T>>)
      setMapCenter([location.lng, location.lat])
    }
  }, [locationDetail])

  return (
    <Card className={cn('flex flex-col relative', className)}>
      <GoongMap className='relative h-full' center={mapCenter} />
      <div className='p-1.5 absolute w-full bottom-0 z-10'>
        {watch(name) && locationDetail ? (
          <Card className='flex gap-3 py-2 px-4 items-center'>
            <MapPin size={18} className='mt-0.5 text-muted-foreground' />
            <div className='flex flex-col'>
              <p className='font-medium text-sm'>{locationDetail.name}</p>
              <p className='text-muted-foreground text-xs'>
                {locationDetail.formatted_address.replace(locationDetail.name + ', ', '')}
              </p>
            </div>
            <X
              size={18}
              className='text-muted-foreground cursor-pointer ml-auto'
              onClick={() => {
                setValue(name, defaultLocationValues as PathValue<T, Path<T>>)
                setMapCenter([0, 0])
              }}
            />
          </Card>
        ) : (
          <>
            <div className='h-10 mt-auto relative'>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder='Enter location'
                className='w-full h-full'
                autoFocus
                StartIcon={MapPin}
                {...(locationName && { EndIcon: X, onClickEndIcon: () => setLocationName('') })}
              />
            </div>
            {locationName && locations?.predictions && (
              <Card className='absolute top-12'>
                <ScrollArea className='h-48'>
                  {locations.predictions.map((location) => (
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
              </Card>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

export default MapInputCard
