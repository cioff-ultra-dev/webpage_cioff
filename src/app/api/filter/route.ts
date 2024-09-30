import {
  categories,
  countriesTable,
  festivals,
  festivalsLang,
  festivalsToCategoriesTable,
  SelectCountries,
  SelectFestival,
  SelectFestivalLang,
  SelectLanguages,
} from "@/db/schema";
import { db } from "@/db";
import { and, eq, gte, ilike, inArray, lte, SQLWrapper } from "drizzle-orm";
import { NextRequest } from "next/server";

const PAGE_SIZE = 10;

export type BuildFilterType = Awaited<ReturnType<typeof buildFilter>>;

async function buildFilter(request: NextRequest) {
  const categoriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("categories") || "[]"
  );
  const search: string = request.nextUrl.searchParams.get("search") || "";
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

  const filters: SQLWrapper[] = [];

  const baseQuery = db
    .select({
      festival: festivals,
      country: countriesTable,
      lang: festivalsLang,
    })
    .from(festivalsToCategoriesTable)
    .innerJoin(
      festivals,
      eq(festivalsToCategoriesTable.festivalId, festivals.id)
    )
    .leftJoin(festivalsLang, eq(festivals.id, festivalsLang.festivalId))
    .leftJoin(countriesTable, eq(festivals.countryId, countriesTable.id))
    .leftJoin(
      categories,
      eq(festivalsToCategoriesTable.categoryId, categories.id)
    )
    .$dynamic();

  // filters.push(eq(festivals.publish, true));

  if (rangeDateFrom || rangeDateTo) {
    filters.push(
      gte(festivals.createdAt, new Date(Number(rangeDateFrom) * 1000)),
      lte(festivals.createdAt, new Date(Number(rangeDateTo) * 1000))
    );
  }

  if (categoriesIn.length) {
    filters.push(inArray(categories.slug, categoriesIn));
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

  baseQuery
    .where(and(...filters))
    .groupBy(festivals.id, countriesTable.id, festivalsLang.id)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const result = (await baseQuery).reduce<
    Record<
      number,
      {
        festival: SelectFestival;
        country: SelectCountries | null;
        langs: SelectFestivalLang[];
      }
    >
  >((acc, row) => {
    const festival = row.festival;
    const country = row.country;
    const lang = row.lang;
    if (!acc[festival.id]) {
      acc[festival.id] = { festival, country, langs: [] };
    }

    if (lang) {
      acc[festival.id].langs.push(lang);
    }

    return acc;
  }, {});

  return Object.values(result);
}

export async function GET(request: NextRequest) {
  const result = await buildFilter(request);
  return Response.json(result);
}
