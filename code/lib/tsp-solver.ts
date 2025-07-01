import type { Attraction, DistanceData } from "./types"

export function findBestRoute(
  attractions: Attraction[],
  distances: DistanceData,
): { orderedRoute: Attraction[]; totalTravelTime: number; totalTravelCost: number } {
  if (attractions.length <= 1) {
    return { orderedRoute: attractions, totalTravelTime: 0, totalTravelCost: 0 }
  }

  const unvisited = new Set(attractions.map((a) => a.id))
  const route: Attraction[] = []
  let totalTravelTime = 0
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
      const cost = distances.costs[currentAttraction.id]?.[nearestNeighbor.id] ?? 0
      totalTravelTime += minTime
      totalTravelCost += cost
      currentAttraction = nearestNeighbor
      route.push(currentAttraction)
      unvisited.delete(currentAttraction.id)
    } else {
      break
    }
  }

  return { orderedRoute: route, totalTravelTime, totalTravelCost }
}
