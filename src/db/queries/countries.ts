import { db } from "@/db";
import { countries, festivals, languages, SelectLanguages } from "@/db/schema";
import { defaultLocale } from "@/i18n/config";
import { and, count, eq, inArray, isNotNull } from "drizzle-orm";

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
      country: countries.slug,
      lat: countries.lat,
      lng: countries.lng,
      festivalsCount: count(festivals.id),
    })
    .from(countries)
    .leftJoin(festivals, eq(countries.id, festivals.countryId))
    .where(and(isNotNull(festivals.countryId), eq(festivals.published, true)))
    .groupBy(countries.id)
    .orderBy(countries.slug);
}

export async function getallCountries(locale: string) {
  const localeValue = locale as SelectLanguages["code"];
  const currentDefaultLocale = defaultLocale as SelectLanguages["code"];

  const pushLocales = [localeValue];

  if (localeValue !== currentDefaultLocale) {
    pushLocales.push(currentDefaultLocale);
  }

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(inArray(languages.code, pushLocales));

  return db.query.countries.findMany({
    orderBy(fields, { asc }) {
      return [asc(fields.slug)];
    },
    with: {
      langs: {
        where(fields, { inArray }) {
          return inArray(fields.lang, sq);
        },
        with: {
          l: true,
        },
      },
    },
  });
}

export type CountryByLocaleType = Awaited<ReturnType<typeof getallCountries>>;
