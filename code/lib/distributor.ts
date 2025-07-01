import type { Attraction } from "./types"

type DailySchedule = {
  day: number
  attractions: Attraction[]
  timeUsed: number
  costUsed: number
  timeCapacity: number
}

export function distributeAttractions(attractions: Attraction[], dailyHours: number[]): DailySchedule[] {
  const schedules: DailySchedule[] = dailyHours.map((hours, index) => ({
    day: index + 1,
    attractions: [],
    timeUsed: 0,
    costUsed: 0,
    timeCapacity: hours,
  }))

  const sortedAttractions = [...attractions].sort((a, b) => {
    if (a.closes !== b.closes) {
      return a.closes - b.closes
    }
    return b.tempo - a.tempo
  })

  for (const attraction of sortedAttractions) {
    for (const schedule of schedules) {
      const dayStartTime = 9
      const timeAfterVisit = schedule.timeUsed + attraction.tempo
      if (timeAfterVisit <= schedule.timeCapacity && dayStartTime + timeAfterVisit <= attraction.closes) {
        schedule.attractions.push(attraction)
        schedule.timeUsed += attraction.tempo
        schedule.costUsed += attraction.preco
        break
      }
    }
  }

  return schedules.filter((s) => s.attractions.length > 0)
}
