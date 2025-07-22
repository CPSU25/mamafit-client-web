import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useDebounce } from 'use-debounce'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { useForwardGeocoding } from '@/services/maps/useForwardGeocoding'
import { Card } from './ui/card'
import { MapPin, Loader } from 'lucide-react'
import GoongMap from './Goong/GoongMap'

interface AddressFormProps {
  namePrefix?: string
}

export function AddressForm({ namePrefix = '' }: AddressFormProps) {
  const { control, watch, setValue } = useFormContext()

  const prefix = namePrefix ? `${namePrefix}.` : ''

  const province = watch(`${prefix}province`)
  const district = watch(`${prefix}district`)
  const ward = watch(`${prefix}ward`)
  const street = watch(`${prefix}street`)
  const latitude = watch(`${prefix}latitude`)
  const longitude = watch(`${prefix}longitude`)

  // Combine address parts for geocoding
  const addressParts = [street, ward, district, province].filter(Boolean)
  const fullAddress = addressParts.join(', ')

  const [debouncedAddress] = useDebounce(fullAddress, 1000)
  const hasAllFields = addressParts.length === 4

  const { data: geocodingData, isLoading: isGeocoding } = useForwardGeocoding(debouncedAddress, hasAllFields)

  // Auto-update coordinates when geocoding data is available
  useEffect(() => {
    if (geocodingData && geocodingData.length > 0) {
      const result = geocodingData[0]
      setValue(`${prefix}latitude`, result.geometry.location.lat)
      setValue(`${prefix}longitude`, result.geometry.location.lng)
      setValue(`${prefix}mapId`, result.place_id)
    }
  }, [geocodingData, setValue, prefix])

  const mapCenter: [number, number] = latitude && longitude ? [longitude, latitude] : [105.8542, 21.0285] // Default to Hanoi

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <FormField
          control={control}
          name={`${prefix}province`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province/City</FormLabel>
              <FormControl>
                <Input placeholder='e.g., Hà Nội, TP. Hồ Chí Minh' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}district`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <FormControl>
                <Input placeholder='e.g., Quận Ba Đình, Quận 1' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}ward`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ward</FormLabel>
              <FormControl>
                <Input placeholder='e.g., Phường Trúc Bạch' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${prefix}street`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder='e.g., 123 Đường ABC' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Map Preview */}
      {hasAllFields && (
        <Card className='p-4'>
          <div className='flex items-center gap-2 mb-3'>
            <MapPin className='w-4 h-4' />
            <span className='font-medium'>Location Preview</span>
            {isGeocoding && <Loader className='w-4 h-4 animate-spin' />}
          </div>

          <div className='h-64 rounded-lg overflow-hidden'>
            <GoongMap center={mapCenter} zoom={15} className='w-full h-full' />
          </div>

          {fullAddress && (
            <div className='mt-3 p-2 bg-muted rounded text-sm'>
              <strong>Address:</strong> {fullAddress}
            </div>
          )}

          {latitude && longitude && (
            <div className='mt-2 p-2 bg-muted rounded text-sm'>
              <strong>Coordinates:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
