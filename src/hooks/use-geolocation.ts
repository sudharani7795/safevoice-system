import { useCallback, useEffect, useRef, useState } from 'react'

export type GeoFix = {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

export type GeoState = 'off' | 'requesting' | 'sharing' | 'denied' | 'unavailable' | 'error'

/** Location is read only after an explicit start() and stops on stop(). */
export function useGeolocation() {
  const [state, setState] = useState<GeoState>('off')
  const [fix, setFix] = useState<GeoFix | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    watchRef.current = null
    setFix(null)
    setState('off')
  }, [])

  useEffect(
    () => () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
    },
    [],
  )

  const start = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState('unavailable')
      setError('This browser does not support location services.')
      return
    }
    setError(null)
    setState('requesting')
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setFix({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
        setState('sharing')
      },
      (err) => {
        if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current)
        watchRef.current = null
        if (err.code === err.PERMISSION_DENIED) {
          setState('denied')
          setError('Location permission was denied. Alerts will be sent without coordinates. You can allow location in your browser settings.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setState('unavailable')
          setError('Your position is unavailable right now. Move near a window or turn on device location.')
        } else {
          setState('error')
          setError('Getting your location timed out. Try again.')
        }
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    )
  }, [])

  return { state, fix, error, start, stop }
}
