"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Hourglass,
  Award,
  Clock,
  Wallet,
  MapPin,
  Trash2,
  PartyPopper,
  Save,
  FolderOpen,
  Utensils,
  Route,
  Star,
  MapIcon,
  Car,
  Footprints,
} from "lucide-react"
import type { Attraction, Restaurant } from "@/lib/types"
import { CITIES, type CityData } from "@/data"
import { optimizeItineraryAction } from "@/app/actions"
import { distributeAttractions } from "@/lib/distributor"
import { findBestRoute } from "@/lib/tsp-solver"
import { generateGoogleMapsUrl } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const Map = dynamic(() => import("@/components/map"), { ssr: false })
const routeColors = ["#3b82f6", "#16a34a", "#ef4444", "#f97316", "#8b5cf6", "#ec4899"]
const LOCAL_STORAGE_KEY = "knapsack-no-role-plans"

type TravelMode = "driving" | "walking"

interface DailySchedule {
  day: number
  attractions: Attraction[]
  timeUsed: number
  costUsed: number
  travelTime: number
  travelCost: number
  orderedRoute: Attraction[]
}

interface SavedPlan {
  id: string
  name: string
  cityId: string
  config: {
    numDays: number
    dailyHours: number[]
    budget: number
    visited: string[]
    selectedCategories: string[]
    prioritized: number[]
    travelMode: TravelMode
  }
  result: DailySchedule[]
  summary: Summary
}

interface Summary {
  totalBenefit: number
  totalTime: number
  totalCost: number
  totalTravelCost: number
}

export default function UltimateTravelOptimizerPage() {
  const [selectedCityId, setSelectedCityId] = useState<string>("brasilia")
  const [cityData, setCityData] = useState<CityData | null>(null)
  const [numDays, setNumDays] = useState(2)
  const [dailyHours, setDailyHours] = useState<number[]>([8, 6])
  const [budget, setBudget] = useState(500)
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [prioritized, setPrioritized] = useState<Set<number>>(new Set())
  const [travelMode, setTravelMode] = useState<TravelMode>("driving")
  const [result, setResult] = useState<DailySchedule[] | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [planName, setPlanName] = useState("")
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false)

  useEffect(() => {
    const loadCityData = async () => {
      setIsLoading(true)
      const data = await CITIES[selectedCityId].loader()
      setCityData(data)
      setSelectedCategories(new Set(data.categories))
      setResult(null)
      setSummary(null)
      setVisited(new Set())
      setPrioritized(new Set())
      setIsLoading(false)
    }
    loadCityData()
  }, [selectedCityId])

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const plansFromStorage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]")
        setSavedPlans(plansFromStorage)
      } catch (error) {
        console.error("Failed to parse travel plans from localStorage", error)
        setSavedPlans([])
      }
    }
  }, [])

  useEffect(() => {
    const newDailyHours = Array(numDays).fill(8)
    if (dailyHours.length < numDays) {
      setDailyHours([...dailyHours, ...newDailyHours.slice(dailyHours.length)])
    } else if (dailyHours.length > numDays) {
      setDailyHours(dailyHours.slice(0, numDays))
    }
  }, [numDays])

  const availableAttractions = useMemo(() => {
    if (!cityData) return []
    return cityData.attractions.filter((att) => !visited.has(att.nome) && selectedCategories.has(att.categoria))
  }, [cityData, visited, selectedCategories])

  const handleOptimize = async () => {
    if (!cityData) return
    setIsLoading(true)
    setResult(null)
    setSummary(null)

    const totalTime = dailyHours.reduce((sum, h) => sum + h, 0)
    const optimizationResult = await optimizeItineraryAction(
      selectedCityId,
      availableAttractions,
      totalTime,
      budget,
      Array.from(prioritized),
    )

    if (optimizationResult.selectedAttractions.length > 0) {
      const distributedSchedules = distributeAttractions(optimizationResult.selectedAttractions, dailyHours)
      const finalSchedules = distributedSchedules.map((schedule) => {
        const { orderedRoute, totalTravelTime, totalTravelCost, totalDistance, routeDistances } = findBestRoute(
          schedule.attractions,
          travelMode === "driving" ? cityData.distances.driving : cityData.distances.walking,
        )
        return { ...schedule, orderedRoute, travelTime: totalTravelTime, travelCost: totalTravelCost, totalDistance, routeDistances }
      })

      const totalAttractionCost = finalSchedules.reduce((sum, s) => sum + s.costUsed, 0)
      const totalAttractionTime = finalSchedules.reduce((sum, s) => sum + s.timeUsed, 0)
      const totalDistanceKm = finalSchedules.reduce((sum, s) => sum + (s.totalDistance || 0), 0)

      setResult(finalSchedules)
      setSummary({
        totalBenefit: optimizationResult.totalBenefit,
        totalTime: totalAttractionTime, // Apenas tempo das atrações, não incluir tempo de deslocamento
        totalCost: totalAttractionCost, // Apenas custos de entrada das atrações, sem custos de deslocamento
        totalTravelCost: 0, // Não incluir custos de deslocamento
        totalDistance: totalDistanceKm, // Total de quilômetros percorridos
      })
    } else {
      setResult([])
    }
    setIsLoading(false)
  }

  const handleSavePlan = () => {
    if (!planName || !result || !summary) return
    const newPlan: SavedPlan = {
      id: new Date().toISOString(),
      name: planName,
      cityId: selectedCityId,
      config: {
        numDays,
        dailyHours,
        budget,
        visited: Array.from(visited),
        selectedCategories: Array.from(selectedCategories),
        prioritized: Array.from(prioritized),
        travelMode,
      },
      result,
      summary,
    }
    const updatedPlans = [...savedPlans, newPlan]
    setSavedPlans(updatedPlans)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlans))
    setPlanName("")
    setSaveDialogOpen(false)
  }

  const handleLoadPlan = async (plan: SavedPlan) => {
    if (plan.cityId !== selectedCityId) {
      setSelectedCityId(plan.cityId)
    }
    const data = await CITIES[plan.cityId].loader()
    setCityData(data)

    setNumDays(plan.config.numDays)
    setDailyHours(plan.config.dailyHours)
    setBudget(plan.config.budget)
    setVisited(new Set(plan.config.visited))
    setSelectedCategories(new Set(plan.config.selectedCategories))
    setPrioritized(new Set(plan.config.prioritized))
    setTravelMode(plan.config.travelMode)
    setResult(plan.result)
    setSummary(plan.summary)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDeletePlan = (id: string) => {
    const updatedPlans = savedPlans.filter((p) => p.id !== id)
    setSavedPlans(updatedPlans)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPlans))
  }

  const getRestaurantsForDay = (dayAttractions: Attraction[]): Restaurant[] => {
    if (!cityData) return []
    const attractionIds = new Set(dayAttractions.map((a) => a.id))
    return cityData.restaurants.filter((r) => r.proximo_a.some((id) => attractionIds.has(id)))
  }

  const togglePrioritized = (id: number) => {
    setPrioritized((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
        console.log(`Removida priorização da atração ID: ${id}`)
      } else {
        newSet.add(id)
        console.log(`Adicionada priorização da atração ID: ${id}`)
      }
      console.log('IDs priorizados:', Array.from(newSet))
      return newSet
    })
  }

  if (!cityData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Hourglass className="animate-spin h-12 w-12" />
      </div>
    )
  }

  return (
    <div className="bg-muted/10 min-h-screen w-full">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-8">
        <header className="text-center mb-12">
          <div className="flex justify-center items-center gap-4">
            <Image src="/logo.png" alt="Knapsack no Rolê Logo" width={80} height={80} />
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-accent">Knapsack no Rolê</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Utilizando o algoritmo de Knapsack para gerar roteiros turísticos
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          <div className="xl:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>1. Destino e Modo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cidade</Label>
                  <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CITIES).map(([id, { name }]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Modo de Viagem</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={travelMode === "driving" ? "default" : "outline"}
                      onClick={() => setTravelMode("driving")}
                      className="w-full"
                    >
                      <Car className="mr-2 h-4 w-4" /> Carro
                    </Button>
                    <Button
                      variant={travelMode === "walking" ? "default" : "outline"}
                      onClick={() => setTravelMode("walking")}
                      className="w-full"
                    >
                      <Footprints className="mr-2 h-4 w-4" /> A Pé
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Duração e Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numDays">Dias de viagem</Label>
                  <Input
                    id="numDays"
                    type="number"
                    value={numDays}
                    onChange={(e) => setNumDays(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="budget">Orçamento total para passeios (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number.parseInt(e.target.value) || 0)}
                    step="10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Horas por Dia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dailyHours.map((hours, index) => (
                  <div key={index}>
                    <Label>
                      Dia {index + 1}: {hours} horas
                    </Label>
                    <Slider
                      value={[hours]}
                      max={12}
                      min={0}
                      step={1}
                      onValueChange={(v) => setDailyHours(dailyHours.map((h, i) => (i === index ? v[0] : h)))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Filtros de Categoria</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {cityData.categories.map((cat) => (
                  <div key={cat} className="flex items-center space-x-2">
                    <Checkbox
                      id={cat}
                      checked={selectedCategories.has(cat)}
                      onCheckedChange={(c) =>
                        setSelectedCategories((prev) => {
                          const n = new Set(prev)
                          c ? n.add(cat) : n.delete(cat)
                          return n
                        })
                      }
                    />
                    <Label htmlFor={cat} className="text-sm font-normal">
                      {cat}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button onClick={handleOptimize} className="w-full text-lg py-6" disabled={isLoading}>
                {isLoading ? "Otimizando..." : "Gerar Roteiro Inteligente"}
              </Button>
              <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent" disabled={!result}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Roteiro Atual
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Salvar Plano de Viagem</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder="Nome do plano (ex: Férias em BSB)"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                  <Button onClick={handleSavePlan}>Salvar</Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>


          <div className="xl:col-span-2">
            <Card className="min-h-[700px]">
              <CardHeader>
                <CardTitle>Seu Roteiro Otimizado para {CITIES[selectedCityId].name}</CardTitle>
                <CardDescription>A melhor combinação de passeios, com rotas e sugestões.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="text-center p-8">
                    Calculando... <Hourglass className="inline-block animate-spin ml-2" />
                  </div>
                )}
                {result && !isLoading && (
                  <>
                    {result.length > 0 && summary ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center p-4 bg-muted rounded-lg">
                            <div className="flex flex-col items-center">
                              <Award className="h-6 w-6 text-secondary mb-1" />
                              <span className="font-bold text-xl">{summary.totalBenefit.toFixed(0)}</span>
                              <span className="text-sm text-muted-foreground">Benefício</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <Clock className="h-6 w-6 text-blue-500 mb-1" />
                              <span className="font-bold text-xl">{summary.totalTime}h</span>
                              <span className="text-sm text-muted-foreground">Passeios</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <Wallet className="h-6 w-6 text-accent mb-1" />
                              <span className="font-bold text-xl">
                                R$ {summary.totalCost.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground">Custo Total</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <MapPin className="h-6 w-6 text-green-500 mb-1" />
                              <span className="font-bold text-xl">
                                {(summary.totalDistance || 0).toFixed(1)} km
                              </span>
                              <span className="text-sm text-muted-foreground">Deslocamento</span>
                            </div>
                          </div>
                          <Accordion
                            type="multiple"
                            defaultValue={result.map((d) => `day-${d.day}`)}
                            className="w-full"
                          >
                            {result.map((day) => (
                              <AccordionItem key={day.day} value={`day-${day.day}`}>
                                <AccordionTrigger className="text-lg font-semibold">
                                  Dia {day.day} (Passeios: {day.timeUsed}h | Desloc.: ~{day.travelTime} min)
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="font-semibold mb-2 flex items-center">
                                    <Route className="mr-2 h-5 w-5 text-primary" /> Rota Otimizada:
                                  </div>
                                  <ol className="list-decimal list-inside space-y-2 mb-4">
                                    {day.orderedRoute.map((att, index) => {
                                      const distance = index === 0 ? 0 : (day.routeDistances?.[index - 1] || 0)
                                      return (
                                        <li key={att.id} className="flex justify-between items-center">
                                          <span>
                                            {att.nome} ({att.tempo}h) | R$ {att.preco.toFixed(2)} |
                                            <span className="text-muted-foreground"> {distance.toFixed(1)} km</span>
                                          </span>
                                        </li>
                                      )
                                    })}
                                  </ol>
                                  <div className="font-semibold mb-2 flex items-center">
                                    <Utensils className="mr-2 h-5 w-5 text-primary" /> Sugestões de Restaurantes:
                                  </div>
                                  <ul className="list-disc list-inside space-y-1 text-sm">
                                    {getRestaurantsForDay(day.attractions).map((r) => (
                                      <li key={r.nome}>
                                        {r.nome} ({r.tipo})
                                      </li>
                                    ))}
                                  </ul>
                                  <Button
                                    className="mt-4 w-full"
                                    onClick={() =>
                                      window.open(generateGoogleMapsUrl(day.orderedRoute, travelMode), "_blank")
                                    }
                                  >
                                    <MapIcon className="mr-2 h-4 w-4" /> Abrir no Google Maps
                                  </Button>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                        <div className="h-[600px] rounded-lg overflow-hidden sticky top-8 relative">
                          <Map
                            schedules={result}
                            center={cityData.center}
                            travelMode={travelMode}
                            key={selectedCityId}
                            routeColors={routeColors}
                          />
                          <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-md shadow-lg backdrop-blur-sm z-[1000]">
                            <h4 className="font-bold text-sm mb-1">Legenda</h4>
                            <ul className="space-y-1">
                              {result.map((day, index) => (
                                <li key={day.day} className="flex items-center text-xs">
                                  <span
                                    className="w-4 h-1.5 inline-block mr-2 rounded-full"
                                    style={{ backgroundColor: routeColors[index % routeColors.length] }}
                                  ></span>
                                  Dia {day.day}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 flex flex-col items-center">
                        <PartyPopper className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="font-semibold">Nenhum roteiro encontrado!</p>
                        <p className="text-muted-foreground mt-1">
                          Tente aumentar o tempo, o orçamento ou selecionar mais categorias.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {!result && !isLoading && (
                  <div className="text-center p-8 flex flex-col items-center">
                    <MapPin className="w-12 h-12 text-primary/50 mb-4" />
                    <p className="font-semibold">Seu plano de viagem aparecerá aqui.</p>
                    <p className="text-muted-foreground mt-1">Ajuste os parâmetros e clique no botão para começar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Meus Roteiros Salvos</CardTitle>
                <CardDescription>Carregue ou exclua um roteiro salvo anteriormente.</CardDescription>
              </CardHeader>
              <CardContent>
                {savedPlans.length > 0 ? (
                  <div className="space-y-2">
                    {savedPlans.map((p) => (
                      <div key={p.id} className="flex justify-between items-center p-2 border rounded-lg">
                        <div className="flex flex-col">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-sm text-muted-foreground">{CITIES[p.cityId]?.name}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleLoadPlan(p)}>
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Carregar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">Nenhum roteiro salvo.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Atrações Disponíveis em {CITIES[selectedCityId].name}</CardTitle>
                <CardDescription>Marque com uma estrela as que deseja priorizar.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-4">
                    {cityData.attractions.map((item) => (
<CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
  <div className="p-1">
    <Card
      className={`h-[350px] flex flex-col overflow-hidden rounded-lg ${visited.has(item.nome) ? "bg-muted/50" : ""}`}
    >
      <div className="relative">
        <div className={`relative ${visited.has(item.nome) ? "blur-sm" : ""}`}>
          <Image
            src={item.image}
            alt={`Imagem de ${item.nome}`}
            width={400}
            height={225}
            className="object-cover w-full h-40 transition-all duration-300"
          />
        </div>
        <div className="absolute top-2 right-2 flex items-center bg-black/50 rounded-full p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => togglePrioritized(item.id)}
            title="Priorizar"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                prioritized.has(item.id)
                  ? "text-secondary fill-secondary"
                  : "text-white/80"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setVisited((prev) => {
                const n = new Set(prev)
                n.has(item.nome) ? n.delete(item.nome) : n.add(item.nome)
                return n
              })
            }
            title="Excluir do Roteiro"
          >
            <Trash2
              className={`h-4 w-4 transition-colors ${
                visited.has(item.nome) ? "text-destructive" : "text-white/80"
              }`}
            />
          </Button>
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <h3
          className={`font-bold text-lg ${
            visited.has(item.nome) ? "line-through text-muted-foreground" : ""
          }`}
        >
          {item.nome}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
          {item.descricao}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground border-t mt-auto">
        <span className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          {item.tempo}h
        </span>
        <span className="flex items-center">
          <Wallet className="mr-1 h-4 w-4" />
          R$ {item.preco.toFixed(2)}
        </span>
        <span className="flex items-center">
          <MapPin className="mr-1 h-4 w-4" />
          {item.categoria}
        </span>
      </CardFooter>
    </Card>
  </div>
</CarouselItem>

                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="ml-12 hidden sm:flex" />
                  <CarouselNext className="mr-12 hidden sm:flex" />
                </Carousel>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
