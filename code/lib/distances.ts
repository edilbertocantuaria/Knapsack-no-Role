export const travelTimes: Record<number, Record<number, number>> = {
  1: { 2: 5, 3: 2, 4: 3, 8: 5, 10: 15, 12: 12 },
  2: { 1: 5, 3: 4, 4: 5, 8: 2, 10: 12, 12: 10 },
  3: { 1: 2, 2: 4, 4: 1, 8: 4, 10: 16, 12: 13 },
  4: { 1: 3, 2: 5, 3: 1, 8: 5, 10: 17, 12: 14 },
  5: { 9: 5, 13: 8 },
  6: { 7: 10, 10: 8, 12: 10 },
  7: { 6: 10, 10: 5, 12: 8 },
  8: { 1: 5, 2: 2, 3: 4, 4: 5, 10: 10, 12: 8 },
  9: { 5: 5, 13: 10 },
  10: { 1: 15, 2: 12, 3: 16, 4: 17, 6: 8, 7: 5, 8: 10, 12: 5 },
  11: { 13: 20 },
  12: { 1: 12, 2: 10, 3: 13, 4: 14, 6: 10, 7: 8, 8: 8, 10: 5 },
  13: { 5: 8, 9: 10, 11: 20 },
  14: { 12: 5, 15: 10 },
  15: { 14: 10 },
  16: {},
}

Object.keys(travelTimes).forEach((fromIdStr) => {
  const fromId = Number.parseInt(fromIdStr)
  const destinations = travelTimes[fromId]
  Object.keys(destinations).forEach((toIdStr) => {
    const toId = Number.parseInt(toIdStr)
    if (!travelTimes[toId]) travelTimes[toId] = {}
    travelTimes[toId][fromId] = destinations[toId]
  })
})
