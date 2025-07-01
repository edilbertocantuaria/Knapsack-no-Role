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
