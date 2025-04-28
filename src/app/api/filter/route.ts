import {
  categories,
  countries,
  countriesLang,
  events,
  festivalCoverPhotos,
  festivals,
  festivalsLang,
  festivalToCategories,
  languages,
  SelectCountries,
  SelectCountryLang,
  SelectEvent,
  SelectFestival,
  SelectFestivalLang,
  SelectStorage,
  storages,
} from "@/db/schema";
import { db } from "@/db";
import {
  aliasedTable,
  and,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  SQLWrapper,
} from "drizzle-orm";
import { NextRequest } from "next/server";
import { defaultLocale, Locale } from "@/i18n/config";

const logoStorage = aliasedTable(storages, "logo");
const coverStorage = aliasedTable(storages, "cover");

export type BuildFilterType = Awaited<ReturnType<typeof buildFilter>>;

async function buildFilter(request: NextRequest) {
  const categoriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("categories") || "[]"
  );
  const countriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("countries") || "[]"
  );
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const type: string = request.nextUrl.searchParams.get("type") || "";
  const rangeDateFrom: string =
    request.nextUrl.searchParams.get("rangeDateFrom") || "";
  const rangeDateTo: string =
    request.nextUrl.searchParams.get("rangeDateTo") || "";
  const page: number = Number(request.nextUrl.searchParams.get("page") || "1");
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "0"
  );
  const festivalId: number = Number(
    request.nextUrl.searchParams.get("festivalId") || "0"
  );
  const locale: Locale =
    (request.nextUrl.searchParams.get("locale") as Locale) || defaultLocale;
  const pageSize: number = Number(
    request.nextUrl.searchParams.get("pageSize") || "10"
  );
  const regionsIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("regions") || "[]"
  );

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const baseQuery = db
    .selectDistinctOn([festivals.id], {
      festival: festivals,
      country: countries,
      lang: festivalsLang,
      countryLang: countriesLang,
      event: events,
      logo: logoStorage,
      cover: coverStorage,
    })
    .from(festivals)
    .leftJoin(
      festivalToCategories,
      eq(festivalToCategories.festivalId, festivals.id)
    )
    .leftJoin(events, eq(events.festivalId, festivals.id))
    .leftJoin(festivalsLang, eq(festivals.id, festivalsLang.festivalId))
    .leftJoin(countries, eq(festivals.countryId, countries.id))
    .leftJoin(countriesLang, eq(countriesLang.countryId, countries.id))
    .leftJoin(categories, eq(festivalToCategories.categoryId, categories.id))
    .leftJoin(logoStorage, eq(festivals.logoId, logoStorage.id))
    .leftJoin(coverStorage, eq(festivals.coverId, coverStorage.id))
    .$dynamic();

  // filters.push(eq(festivals.publish, true));
  filters.push(isNotNull(festivals.location), isNotNull(festivals.countryId));
  filters.push(eq(countriesLang.lang, sq));
  filters.push(eq(festivalsLang.lang, sq));

  if (rangeDateFrom || rangeDateTo) {
    filters.push(
      gte(events.startDate, new Date(Number(rangeDateFrom) * 1000)),
      lte(events.endDate, new Date(Number(rangeDateTo || rangeDateFrom) * 1000))
    );
  } else {
    // filters.push(gte(events.startDate, new Date()));
  }

  if (categoriesIn.length) {
    filters.push(inArray(categories.id, categoriesIn.map(Number)));
  }

  if (countriesIn.length) {
    filters.push(inArray(festivals.countryId, countriesIn.map(Number)));
  }

  if (countryId) {
    filters.push(eq(festivals.countryId, countryId));
  }

  if (festivalId) {
    filters.push(eq(festivals.id, festivalId));
  }

  if (search) {
    filters.push(ilike(festivalsLang.name, `%${search}%`));
  }

  if (regionsIn?.length)
      filters.push(inArray(countries.regionId, regionsIn.map(Number)));

  baseQuery
    .where(and(...filters))
    .groupBy(
      festivals.id,
      countries.id,
      events.id,
      festivalsLang.id,
      countriesLang.id,
      logoStorage.id,
      coverStorage.id
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const result = await (
    await baseQuery
  ).reduce<
    Promise<
      Record<
        number,
        {
          festival: SelectFestival;
          country: SelectCountries | null;
          lang: SelectFestivalLang;
          countryLang: SelectCountryLang;
          event: SelectEvent | null;
          logo: SelectStorage;
          events: SelectEvent[];
          cover: SelectStorage;
          coverPhotos: { photoId: number | null; url: string | null }[];
        }
      >
    >
  >(async (acc, row) => {
    const record = await acc;

    const festival = row.festival;
    const country = row.country;
    const lang = row.lang;
    const countryLang = row.countryLang;
    const event = row.event;
    const logo = row.logo;
    const cover = row.cover;

    if (!record[festival.id]) {
      const coverPhotos = await db
        .select({
          photoId: festivalCoverPhotos.photoId,
          url: storages.url,
        })
        .from(festivalCoverPhotos)
        .leftJoin(storages, eq(festivalCoverPhotos.photoId, storages.id))
        .where(eq(festivalCoverPhotos.festivalId, festival.id));

      record[festival.id] = {
        festival,
        country,
        lang: lang!,
        countryLang: countryLang!,
        event: event || null,
        logo: logo!,
        events: [],
        cover: cover!,
        coverPhotos: coverPhotos ?? [],
      };
    }

    if (event) {
      const eventList = await db
        .select()
        .from(events)
        .where(eq(events.festivalId, festival.id));

      record[festival.id].events.push(...eventList);
    }

    return record;
  }, Promise.resolve({}));

  return Object.values(result);
}

export async function GET(request: NextRequest) {
  const result = await buildFilter(request);
  return Response.json(result);
}
