export interface Attraction {
  id: number;
  nome: string;
  descricao: string;
  tempo: number;
  preco: number;
  avaliacao: number;
  categoria: string;
  beneficio: number;
  lat: number;
  lng: number;
  opens: number;
  closes: number;
  image?: string;
}

export interface Restaurant {
  nome: string;
  tipo: string;
  proximo_a: number[];
}

export interface DistanceData {
  times: Record<number, Record<number, number>>;
  costs: Record<number, Record<number, number>>;
}

export interface CityData {
  attractions: Attraction[];
  restaurants: Restaurant[];
  categories: string[];
  distances: {
    driving: DistanceData;
    walking: DistanceData;
  };
  center: [number, number];
}
