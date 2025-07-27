import type { CityData } from "@/lib/types";

export const CITIES: Record<
  string,
  { name: string; loader: () => Promise<CityData> }
> = {
  brasilia: {
    name: "Brasília, DF",
    loader: () => import("./brasilia").then((m) => m.default),
  },
  "rio-de-janeiro": {
    name: "Rio de Janeiro, RJ",
    loader: () => import("./rio-de-janeiro").then((m) => m.default),
  },
  // "sao-paulo": {
  //   name: "São Paulo, SP",
  //   loader: () => import("./sao-paulo").then((m) => m.default),
  // },
};
