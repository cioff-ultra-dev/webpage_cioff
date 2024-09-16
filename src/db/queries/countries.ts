import { db } from "@/db";
import { countriesTable, festivals } from "@/db/schema";
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
      id: countriesTable.id,
      country: countriesTable.name,
      lat: countriesTable.lat,
      lng: countriesTable.lng,
      festivalsCount: count(festivals.id),
    })
    .from(countriesTable)
    .leftJoin(festivals, eq(countriesTable.id, festivals.countryId))
    .where(and(isNotNull(festivals.countryId), eq(festivals.publish, true)))
    .groupBy(countriesTable.id)
    .orderBy(countriesTable.name);
}
