"use server";

import { db } from "@/db";
import {
  categories,
  countries,
  countriesLang,
  events,
  festivals,
  festivalsLang,
  festivalToCategories,
  languages,
  SelectLanguages,
} from "@/db/schema";
import { defaultLocale, Locale } from "@/i18n/config";
import { and, eq, gte, ilike, inArray, isNotNull, lte, SQLWrapper } from "drizzle-orm";
import { getLocale } from "next-intl/server";

export type CountryCastFestivals = {
  id: number;
  country: string | null;
  lat: string | null;
  lng: string | null;
  name: string | null;
  location: string | null;
  countryId: number | null;
}[];

export async function getAllCountryCastFestivals(
  locale: Locale,
  regionsIn: string[] = [],
  search?: string,
  countriesIn?: string[],
  categoriesIn?: string[],
  rangeDateFrom?: string,
  rangeDateTo?: string
): Promise<CountryCastFestivals> {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const query = db
    .select({
      id: festivals.id,
      country: countriesLang.name,
      countryId: countries.id,
      lat: festivals.lat,
      lng: festivals.lng,
      location: festivals.location,
      name: festivalsLang.name,
    })
    .from(festivals)
    .leftJoin(festivalsLang, eq(festivalsLang.festivalId, festivals.id))
    .leftJoin(countriesLang, eq(festivals.countryId, countriesLang.countryId))
    .leftJoin(countries, eq(countries.id, festivals.countryId))
    .leftJoin(
      festivalToCategories,
      eq(festivalToCategories.festivalId, festivals.id)
    )
    .leftJoin(categories, eq(festivalToCategories.categoryId, categories.id))
    .leftJoin(events, eq(events.festivalId, festivals.id))
    .$dynamic();

  filters.push(
    isNotNull(festivals.countryId),
    isNotNull(festivals.location),
    eq(countriesLang.lang, sq),
    eq(festivalsLang.lang, sq)
  );

  if (regionsIn?.length)
    filters.push(inArray(countries.regionId, regionsIn.map(Number)));

  if (search) filters.push(ilike(festivalsLang.name, `%${search}%`));

  if (countriesIn?.length)
    filters.push(inArray(festivals.countryId, countriesIn.map(Number)));

  if (categoriesIn?.length)
    filters.push(inArray(categories.id, categoriesIn.map(Number)));

  if (rangeDateFrom || rangeDateTo)
    filters.push(
      gte(events.startDate, new Date(Number(rangeDateFrom) * 1000)),
      lte(events.endDate, new Date(Number(rangeDateTo || rangeDateFrom) * 1000))
    );

  query
    .where(and(...filters))
    .groupBy(countries.id, countriesLang.id, festivals.id, festivalsLang.id)
    .orderBy(countries.slug);

  return query;
}

export async function getAllCountries() {
  const locale = await getLocale();
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

export type CountryByLocaleType = Awaited<ReturnType<typeof getAllCountries>>;
