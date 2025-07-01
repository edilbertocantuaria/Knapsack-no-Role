"use server"

import type { Attraction } from "@/lib/types"
import { optimizeItinerary } from "@/lib/optimizer"
import { CITIES } from "@/data"

type TravelMode = "driving" | "walking"

export async function optimizeItineraryAction(
  cityId: string,
  availableAttractions: Attraction[],
  maxTime: number,
  maxCost: number,
  prioritizedIds: number[],
): Promise<{
  selectedAttractions: Attraction[]
  totalBenefit: number
  totalTime: number
  totalCost: number
}> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const cityData = await CITIES[cityId].loader()
  const result = optimizeItinerary(
    availableAttractions,
    maxTime,
    maxCost,
    prioritizedIds,
    cityData.distances.driving, // Use driving cost for budget calculation
  )
  return result
}

export async function getRouteAction(coordinates: string, travelMode: TravelMode): Promise<[number, number][] | null> {
  const profile = travelMode === "walking" ? "foot" : "driving"
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`,
    )
    if (!response.ok) {
      console.error("OSRM API Error:", response.statusText)
      return null
    }
    const data = await response.json()
    const geometry: [number, number][] = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [
      coord[1],
      coord[0],
    ])
    return geometry
  } catch (error) {
    console.error("Failed to fetch route:", error)
    return null
  }
}
