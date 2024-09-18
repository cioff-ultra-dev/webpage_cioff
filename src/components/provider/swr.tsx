"use client";

import { CountryCastFestivals } from "@/db/queries/countries";
import { SelectFestival } from "@/db/schema";
import { SWRConfig } from "swr";

export function SWRProvider({
  children,
  fallbackFestivals,
  fallbackCountryCast,
}: {
  children: React.ReactNode;
  fallbackFestivals: { festivals: SelectFestival }[];
  fallbackCountryCast: CountryCastFestivals;
}) {
  const fallback = {
    "/api/filter?categories=[]&countryId=0&page=1": fallbackFestivals,
    "/api/filter/country": fallbackCountryCast,
  };

  return <SWRConfig value={{ fallback }}>{children}</SWRConfig>;
}
