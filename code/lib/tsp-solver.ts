import type { Attraction, DistanceData } from "./types"
import { calculateDistance } from "./utils"

export function findBestRoute(
  attractions: Attraction[],
  distances: DistanceData,
): { orderedRoute: Attraction[]; totalTravelTime: number; totalTravelCost: number; totalDistance: number; routeDistances: number[] } {
  if (attractions.length <= 1) {
    return { orderedRoute: attractions, totalTravelTime: 0, totalTravelCost: 0, totalDistance: 0, routeDistances: [] }
  }

  const unvisited = new Set(attractions.map((a) => a.id))
  const route: Attraction[] = []
  const routeDistances: number[] = []
  let totalTravelTime = 0
  let totalDistance = 0
  // Remover custos de deslocamento - manter apenas custos de entrada das atrações
  let totalTravelCost = 0

  let currentAttraction = attractions[0]
  route.push(currentAttraction)
  unvisited.delete(currentAttraction.id)

  while (unvisited.size > 0) {
    let nearestNeighbor: Attraction | null = null
    let minTime = Number.POSITIVE_INFINITY

    const unvisitedAttractions = attractions.filter((a) => unvisited.has(a.id))

    for (const neighbor of unvisitedAttractions) {
      const time = distances.times[currentAttraction.id]?.[neighbor.id] ?? Number.POSITIVE_INFINITY
      if (time < minTime) {
        minTime = time
        nearestNeighbor = neighbor
      }
    }

    if (nearestNeighbor) {
      // Calcular distância em km entre as atrações
      const distance = calculateDistance(
        currentAttraction.lat,
        currentAttraction.lng,
        nearestNeighbor.lat,
        nearestNeighbor.lng
      )

      // Não incluir custos de deslocamento (combustível/estacionamento)
      // const cost = distances.costs[currentAttraction.id]?.[nearestNeighbor.id] ?? 0
      totalTravelTime += minTime
      totalDistance += distance
      routeDistances.push(distance)
      // totalTravelCost += cost // Removido - não somar custos de deslocamento
      currentAttraction = nearestNeighbor
      route.push(currentAttraction)
      unvisited.delete(currentAttraction.id)
    } else {
      break
    }
  }

  return { orderedRoute: route, totalTravelTime, totalTravelCost, totalDistance, routeDistances }
}
