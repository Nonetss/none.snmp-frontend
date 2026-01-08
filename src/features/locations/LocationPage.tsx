import React, { useState, useEffect } from 'react'
import LocationManager from '@/features/settings/LocationManager'

const LocationPage: React.FC = () => {
  return (
    <div className="p-8 bg-black text-white font-mono min-h-screen space-y-8 w-full">
      <div className="max-w-[1200px] mx-auto">
        <LocationManager />
      </div>
    </div>
  )
}

export default LocationPage
