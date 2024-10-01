import { db } from "@/db";
import { countries, festivals } from "@/db/schema";
import { and, count, eq, isNotNull } from "drizzle-orm";

export type CountryCastFestivals = {
  id: number;
  country: string | null;
  lat: string | null;
  lng: string | null;
  festivalsCount: number;
}[];

export async function getAllCountryCastFestivals(): Promise<CountryCastFestivals> {
  return db
    .select({
      id: countries.id,
      country: countries.name,
      lat: countries.lat,
      lng: countries.lng,
      festivalsCount: count(festivals.id),
    })
    .from(countries)
    .leftJoin(festivals, eq(countries.id, festivals.countryId))
    .where(and(isNotNull(festivals.countryId), eq(festivals.published, true)))
    .groupBy(countries.id)
    .orderBy(countries.name);
}
