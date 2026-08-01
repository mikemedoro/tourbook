"use client"

import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface VenueMarker {
  id: string
  lat: number
  lng: number
  label: string
  city: string
  state?: string | null
  country?: string | null
}

interface VenueMapProps {
  markers: VenueMarker[]
}

async function geocodeVenue(
  label: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const params = new URLSearchParams({ name: label, city })
    const res = await fetch(`/api/geocode?${params}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function VenueMap({ markers }: VenueMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [resolved, setResolved] = useState<VenueMarker[] | null>(
    markers.length === 0 ? [] : null
  )

  // Geocode each venue to get precise coords (overrides city-level coords from Setlist.fm)
  useEffect(() => {
    if (markers.length === 0) return
    Promise.all(
      markers.map(async (m) => {
        const coords = await geocodeVenue(m.label, m.city)
        return coords ? { ...m, lat: coords.lat, lng: coords.lng } : m
      })
    ).then(setResolved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Initialize map once geocoding completes
  useEffect(() => {
    if (!resolved || !mapContainer.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center:
        resolved.length > 0
          ? [resolved[0].lng, resolved[0].lat]
          : [-98.5795, 39.8283],
      zoom: resolved.length > 0 ? 5 : 3,
    })

    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    map.on("load", () => {
      resolved.forEach((marker) => {
        const el = document.createElement("div")
        el.style.width = "14px"
        el.style.height = "14px"
        el.style.borderRadius = "50%"
        el.style.backgroundColor = "#ff6c45"
        el.style.border = "2px solid #f3ece6"
        el.style.boxShadow = "0 1px 4px rgba(29,29,29,0.35)"
        el.style.cursor = "pointer"

        new mapboxgl.Marker({ element: el })
          .setLngLat([marker.lng, marker.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 10 }).setHTML(
              `<div style="font-weight:600;font-size:0.875rem">${marker.label}</div><div style="font-size:0.75rem;color:#9ca3af">${marker.city}</div>`
            )
          )
          .addTo(map)
      })

      if (resolved.length > 1) {
        const bounds = new mapboxgl.LngLatBounds()
        resolved.forEach((m) => bounds.extend([m.lng, m.lat]))
        map.fitBounds(bounds, { padding: 60, maxZoom: 13 })
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [resolved])

  if (markers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg border bg-muted text-muted-foreground text-sm">
        No venues with location data yet.
      </div>
    )
  }

  if (!resolved) {
    return (
      <div className="flex items-center justify-center h-120 rounded-lg border bg-muted text-muted-foreground text-sm">
        Loading map…
      </div>
    )
  }

  return (
    <div
      ref={mapContainer}
      className="h-120 rounded-lg overflow-hidden border"
      aria-label="Map of visited venues"
    />
  )
}
