import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { Attraction } from "./types"

type TravelMode = "driving" | "walking"

export function generateGoogleMapsUrl(route: Attraction[], travelMode: TravelMode): string {
  if (route.length === 0) return ""
  if (route.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${route[0].lat},${route[0].lng}`
  }

  const origin = `${route[0].lat},${route[0].lng}`
  const destination = `${route[route.length - 1].lat},${route[route.length - 1].lng}`
  const waypoints = route
    .slice(1, -1)
    .map((att) => `${att.lat},${att.lng}`)
    .join("|")

  const url = new URL("https://www.google.com/maps/dir/")
  url.searchParams.append("api", "1")
  url.searchParams.append("origin", origin)
  url.searchParams.append("destination", destination)
  if (waypoints) {
    url.searchParams.append("waypoints", waypoints)
  }
  url.searchParams.append("travelmode", travelMode)

  return url.toString()
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para calcular distância em km entre duas coordenadas usando fórmula de Haversine
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return Math.round(distance * 10) / 10 // Arredondar para 1 casa decimal
}
