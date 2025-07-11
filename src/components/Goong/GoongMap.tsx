import goongjs from '@goongmaps/goong-js'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils/utils'

import '@goongmaps/goong-js/dist/goong-js.css'

interface GoongMapProps {
  center: [number, number]
  zoom?: number
  className?: string
}

const GoongMap = ({ center, className, zoom = 15 }: GoongMapProps) => {
  const mapContainerRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    goongjs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_API_KEY

    const map = new goongjs.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.goong.io/assets/goong_map_web.json',
      center,
      zoom
    })

    new goongjs.Marker().setLngLat(center).addTo(map)

    return () => map.remove()
  }, [center, zoom])

  return <div ref={mapContainerRef} className={cn('w-full h-32 rounded-lg', className)} />
}

export default GoongMap
