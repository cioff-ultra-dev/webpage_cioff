import { and, eq, ilike, inArray, SQLWrapper, aliasedTable } from "drizzle-orm";
import { NextRequest } from "next/server";

import {
  countries,
  countriesLang,
  languages,
  SelectCountries,
  SelectCountryLang,
  nationalSections,
  nationalSectionsLang,
  nationalSectionsPositions,
  SelectNationalSectionLang,
  SelectNationalSectionPositions,
  storages,
  SelectStorage,
} from "@/db/schema";
import { db } from "@/db";
import { defaultLocale, Locale } from "@/i18n/config";

const coverStorage = aliasedTable(storages, "cover");

export type BuildNationalSectionFilterType = Awaited<
  ReturnType<typeof buildFilter>
>;

async function buildFilter(request: NextRequest) {
  const countriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("countries") || "[]"
  );
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const page: number = Number(request.nextUrl.searchParams.get("page") || "1");
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "0"
  );
const pageSize: number = Number(
  request.nextUrl.searchParams.get("pageSize") || "10"
);
  const locale: Locale =
    (request.nextUrl.searchParams.get("locale") as Locale) || defaultLocale;

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const baseQuery = db
    .selectDistinctOn([nationalSections.id], {
      country: countries,
      langs: nationalSectionsLang,
      positions: nationalSectionsPositions,
      id: nationalSections.id,
      countryLang: countriesLang,
      cover: coverStorage,
    })
    .from(nationalSections)
    .leftJoin(countries, eq(nationalSections.countryId, countries.id))
    .leftJoin(countriesLang, eq(countriesLang.countryId, countries.id))
    .leftJoin(
      nationalSectionsLang,
      eq(nationalSectionsLang.nsId, nationalSections.id)
    )
    .leftJoin(
      nationalSectionsPositions,
      eq(nationalSectionsPositions.nsId, nationalSections.id)
    )
    .leftJoin(
      coverStorage,
      eq(nationalSectionsPositions.photoId, coverStorage.id)
    )
    .$dynamic();

  filters.push(eq(countriesLang.lang, sq));

  if (countriesIn.length && !countryId) {
    filters.push(inArray(nationalSections.countryId, countriesIn.map(Number)));
  }

  if (countryId) {
    filters.push(eq(nationalSections.countryId, countryId));
  }

  if (search) {
    filters.push(ilike(nationalSectionsLang.name, `%${search}%`));
  }

  baseQuery
    .where(and(...filters))
    .groupBy(
      countries.id,
      countriesLang.id,
      nationalSectionsLang.id,
      nationalSectionsPositions.id,
      nationalSections.id,
      coverStorage.id
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const result = (await baseQuery).reduce<
    Record<
      number,
      {
        country: SelectCountries;
        lang: SelectNationalSectionLang;
        positions: SelectNationalSectionPositions;
        countryLang: SelectCountryLang;
        id: number;
        cover: SelectStorage|null;
      }
    >
  >((acc, row) => {
    const country = row.country;
    const lang = row.langs;
    const position = row.positions;
    const countryLang = row.countryLang;
    const cover = row.cover ?? null;

    if (!acc[row.id]) {
      acc[row.id] = {
        positions: position!,
        country: country!,
        lang: lang!,
        id: row.id,
        countryLang: countryLang!,
        cover: cover,
      };
    }

    return acc;
  }, {});

  return Object.values(result);
}

export async function GET(request: NextRequest) {
  const result = await buildFilter(request);
  return Response.json(result);
}
