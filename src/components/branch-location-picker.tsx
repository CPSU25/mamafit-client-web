import { LocationPicker } from './location-picker'

// Location data interface for LocationPicker
interface LocationData {
  id: string
  name: string
  address: string
  lat: number
  lng: number
}

interface BranchLocationData {
  mapId: string
  shortName: string
  longName: string
  latitude: number
  longitude: number
}

interface BranchLocationPickerProps {
  value?: BranchLocationData
  onChange: (location: BranchLocationData) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function BranchLocationPicker({ value, onChange, disabled, placeholder, className }: BranchLocationPickerProps) {
  // Convert from BranchLocationData to LocationPicker format
  const locationPickerValue =
    value && value.mapId
      ? {
          id: value.mapId,
          name: value.shortName,
          address: value.longName,
          lat: value.latitude,
          lng: value.longitude
        }
      : undefined

  // Handle LocationPicker onChange and convert back to BranchLocationData
  const handleLocationChange = (locationData: LocationData) => {
    if (locationData.id) {
      onChange({
        mapId: locationData.id,
        shortName: locationData.name || '',
        longName: locationData.address || '',
        latitude: locationData.lat || 0,
        longitude: locationData.lng || 0
      })
    } else {
      // Handle clear case
      onChange({
        mapId: '',
        shortName: '',
        longName: '',
        latitude: 0,
        longitude: 0
      })
    }
  }

  return (
    <LocationPicker
      value={locationPickerValue}
      onChange={handleLocationChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
    />
  )
}
