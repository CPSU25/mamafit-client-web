import { useState, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearchLocation } from '@/services/maps/useSearchLocation'
import { useGetLocation } from '@/services/maps/useGetLocation'
import { defaultLocationValues } from '@/services/maps/map-schema'
import GoongMap from './Goong/GoongMap'
import { cn } from '@/lib/utils/utils'

interface LocationData {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

interface Prediction {
  place_id: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface LocationPickerProps {
  value?: LocationData
  onChange: (location: LocationData) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function LocationPicker({
  value,
  onChange,
  placeholder = 'Select location',
  disabled,
  className
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('')
  const [mapCenter, setMapCenter] = useState<[number, number]>([106.660172, 10.762622])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data: searchResults } = useSearchLocation(searchQuery)
  const { data: locationDetail } = useGetLocation(selectedPlaceId)

  useEffect(() => {
    if (locationDetail && selectedPlaceId) {
      const locationData: LocationData = {
        id: selectedPlaceId,
        name: locationDetail.name,
        address: locationDetail.formatted_address,
        lat: locationDetail.geometry.location.lat,
        lng: locationDetail.geometry.location.lng
      }
      onChange(locationData)
      setMapCenter([locationData.lng, locationData.lat])
      setSearchQuery('')
      setSelectedPlaceId('')
      setShowSuggestions(false)
    }
  }, [locationDetail, selectedPlaceId, onChange])

  useEffect(() => {
    if (value && value.lat && value.lng) {
      setMapCenter([value.lng, value.lat])
    }
  }, [value])

  const handleSelectLocation = (placeId: string) => {
    setSelectedPlaceId(placeId)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    onChange(defaultLocationValues)
    setMapCenter([106.660172, 10.762622])
    setSearchQuery('')
    setShowSuggestions(false)
  }

  return (
    <div className={cn('w-full max-w-full', className)}>
      <div className='relative w-full'>
        <GoongMap
          center={mapCenter}
          className='w-full min-h-[90px] max-h-[140px] h-[100px] rounded-lg border'
          zoom={15}
        />
        <div className='absolute left-0 right-0 bottom-0 z-10 p-1 flex flex-col items-center'>
          {value && value.id && value.name ? (
            <Card className='flex gap-1 py-1 px-2 items-center w-full max-w-md shadow-lg'>
              <MapPin size={14} className='mt-0.5 text-muted-foreground flex-shrink-0' />
              <div className='flex flex-col min-w-0 flex-1'>
                <p className='font-medium text-xs truncate'>{value.name}</p>
                <p className='text-muted-foreground text-[10px] truncate'>
                  {value.address.replace(value.name + ', ', '')}
                </p>
                <p className='text-[10px] text-muted-foreground mt-0.5'>
                  Lat: {value.lat.toFixed(6)}, Lng: {value.lng.toFixed(6)}
                </p>
              </div>
              <X size={14} className='text-muted-foreground cursor-pointer flex-shrink-0' onClick={handleClear} />
            </Card>
          ) : (
            <div className='w-full max-w-md relative'>
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                placeholder={placeholder}
                className='w-full h-8 shadow-lg text-xs'
                autoFocus
                StartIcon={MapPin}
                {...(searchQuery && { EndIcon: X, onClickEndIcon: () => setSearchQuery('') })}
                disabled={disabled}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && searchQuery && (
                <Card className='absolute top-9 left-0 right-0 w-full max-h-32 overflow-hidden shadow-xl'>
                  <ScrollArea className='h-32'>
                    {searchResults?.predictions?.length ? (
                      searchResults.predictions.map((location: Prediction) => (
                        <div
                          key={location.place_id}
                          className='p-2 flex items-center gap-1 hover:bg-accent rounded-lg cursor-pointer'
                          onClick={() => handleSelectLocation(location.place_id)}
                        >
                          <div className='flex flex-col min-w-0'>
                            <p className='font-medium text-xs truncate'>{location.structured_formatting.main_text}</p>
                            <p className='font-medium text-[10px] text-muted-foreground truncate'>
                              {location.structured_formatting.secondary_text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className='text-center py-2 text-muted-foreground text-xs'>No locations found</div>
                    )}
                  </ScrollArea>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
