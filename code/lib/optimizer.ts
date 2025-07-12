import type { Attraction, DistanceData } from "./types"

export function optimizeItinerary(
  items: Attraction[],
  maxTime: number,
  maxCost: number,
  prioritizedIds: number[],
  distances: DistanceData,
) {
  const TIME_SCALE = 2
  const scaledMaxTime = maxTime * TIME_SCALE
  const n = items.length
  const prioritizedSet = new Set(prioritizedIds)

  // Multiplicar o benefício das atrações priorizadas por 10
  // para garantir que sejam escolhidas na frente de outras atrações
  const PRIORITY_MULTIPLIER = 10

  const modifiedItems = items.map((item) => ({
    ...item,
    beneficio: prioritizedSet.has(item.id)
      ? item.beneficio * PRIORITY_MULTIPLIER
      : item.beneficio,
  }))

  const weightsTime = modifiedItems.map((item) => Math.round(item.tempo * TIME_SCALE))
  // Usar apenas o preço das atrações para o knapsack, sem custos de deslocamento
  // Os custos de deslocamento serão calculados separadamente pelo TSP solver
  const weightsCost = modifiedItems.map((item) => Math.round(item.preco))
  const values = modifiedItems.map((item) => item.beneficio)

  const dp: number[][][] = Array(n + 1)
    .fill(0)
    .map(() =>
      Array(scaledMaxTime + 1)
        .fill(0)
        .map(() => Array(maxCost + 1).fill(0)),
    )

  for (let i = 1; i <= n; i++) {
    const currentTime = weightsTime[i - 1]
    const currentCost = weightsCost[i - 1]
    const currentValue = values[i - 1]

    for (let t = 0; t <= scaledMaxTime; t++) {
      for (let c = 0; c <= maxCost; c++) {
        if (currentTime > t || currentCost > c) {
          dp[i][t][c] = dp[i - 1][t][c]
        } else {
          const valueWithoutItem = dp[i - 1][t][c]
          const valueWithItem = dp[i - 1][t - currentTime][c - currentCost] + currentValue
          dp[i][t][c] = Math.max(valueWithoutItem, valueWithItem)
        }
      }
    }
  }

  const selectedAttractions: Attraction[] = []
  let t = scaledMaxTime
  let c = maxCost
  for (let i = n; i > 0; i--) {
    if (dp[i][t][c] !== dp[i - 1][t][c]) {
      const selectedItem = items[i - 1]
      selectedAttractions.push(selectedItem)
      t -= weightsTime[i - 1]
      c -= weightsCost[i - 1]
    }
  }

  // Calcular benefícios usando valores originais (sem multiplicador)
  const totalBenefit = selectedAttractions.reduce((sum, item) => sum + item.beneficio, 0)
  const totalTime = selectedAttractions.reduce((sum, item) => sum + item.tempo, 0)
  // Usar apenas o preço das atrações, não incluir custos de deslocamento aqui
  // Os custos de deslocamento serão calculados separadamente no TSP solver
  const totalCost = selectedAttractions.reduce((sum, item) => sum + item.preco, 0)

  // Reverter a ordem das atrações selecionadas
  const reversedAttractions = [...selectedAttractions].reverse()

  return {
    selectedAttractions: reversedAttractions,
    totalBenefit,
    totalTime,
    totalCost,
  }
}
