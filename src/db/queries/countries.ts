import { db } from "@/db";
import {
  countries,
  countriesLang,
  events,
  festivals,
  festivalsLang,
  languages,
  SelectLanguages,
} from "@/db/schema";
import { defaultLocale, Locale } from "@/i18n/config";
import {
  and,
  count,
  countDistinct,
  eq,
  gte,
  inArray,
  isNotNull,
  SQLWrapper,
} from "drizzle-orm";
import { getLocale } from "next-intl/server";

export type CountryCastFestivals = {
  id: number;
  country: string | null;
  lat: string | null;
  lng: string | null;
  name: string | null;
  festivalsCount: number;
}[];

export async function getAllCountryCastFestivals(
  locale: Locale,
  regionsIn: string[] = []
): Promise<CountryCastFestivals> {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const query = db
    .select({
      id: countries.id,
      country: countries.slug,
      lat: countries.lat,
      lng: countries.lng,
      name: countriesLang.name,
      festivalsCount: countDistinct(festivals.id),
    })
    .from(countries)
    .leftJoin(countriesLang, eq(countries.id, countriesLang.countryId))
    .leftJoin(festivals, eq(countries.id, festivals.countryId))
    .$dynamic();

  filters.push(
    // isNotNull(festivals.countryId),
    isNotNull(festivals.location),
    eq(countriesLang.lang, sq)
  );

  if (regionsIn.length) {
    filters.push(inArray(countries.regionId, regionsIn.map(Number)));
  }

  query
    .where(and(...filters))
    .groupBy(countries.id, countriesLang.id)
    .orderBy(countries.slug);

  console.log(query.toSQL());

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
