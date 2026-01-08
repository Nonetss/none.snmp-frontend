import React from 'react'
import LocationManager from '@/features/locations/LocationManager'

interface Props {
  locationId?: string
}

const LocationPage: React.FC<Props> = ({ locationId }) => {
  const viewingId = locationId ? parseInt(locationId, 10) : null

  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      <div className="max-w-[1200px] mx-auto">
        <LocationManager initialViewingId={viewingId} />
      </div>
    </div>
  )
}

export default LocationPage
