"use client"

import React, { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import type { Attraction } from "@/lib/types"
import { getRouteAction } from "@/app/actions"

const icon = L.icon({
  iconUrl: "/placeholder.svg?height=41&width=25",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

type TravelMode = "driving" | "walking"

interface MapProps {
  schedules: {
    day: number
    orderedRoute: Attraction[]
  }[]
  center: [number, number]
  travelMode: TravelMode
  routeColors: string[]
}

export default function Map({ schedules, center, travelMode, routeColors }: MapProps) {
  const [routeGeometries, setRouteGeometries] = useState<Record<number, [number, number][]>>({})

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!schedules || schedules.length === 0) {
        setRouteGeometries({})
        return
      }

      const newGeometries: Record<number, [number, number][]> = {}
      for (const schedule of schedules) {
        if (schedule.orderedRoute.length > 1) {
          const coords = schedule.orderedRoute.map((att) => `${att.lng},${att.lat}`).join(";")
          const geometry = await getRouteAction(coords, travelMode)
          if (geometry) {
            newGeometries[schedule.day] = geometry
          }
        }
      }
      setRouteGeometries(newGeometries)
    }

    fetchRoutes()
  }, [schedules, travelMode])

  return (
    <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {schedules.map((schedule, index) => {
        const color = routeColors[index % routeColors.length]
        const route = routeGeometries[schedule.day]

        return (
          <React.Fragment key={schedule.day}>
            {route && <Polyline pathOptions={{ color, weight: 5, opacity: 0.7 }} positions={route} />}
            {schedule.orderedRoute.map((att) => (
              <Marker key={att.id} position={[att.lat, att.lng]} icon={icon}>
                <Popup>
                  <b>{att.nome}</b>
                  <br />
                  Dia {schedule.day}
                </Popup>
              </Marker>
            ))}
          </React.Fragment>
        )
      })}
    </MapContainer>
  )
}
