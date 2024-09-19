import {
  categories,
  countriesTable,
  festivals,
  festivalsToCategoriesTable,
} from "@/db/schema";
import { db } from "@/db";
import {
  and,
  asc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  sql,
  SQLWrapper,
} from "drizzle-orm";
import { NextRequest } from "next/server";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const categoriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("categories") || "[]",
  );
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const rangeDateFrom: string =
    request.nextUrl.searchParams.get("rangeDateFrom") || "";
  const rangeDateTo: string =
    request.nextUrl.searchParams.get("rangeDateTo") || "";
  const page: number = Number(request.nextUrl.searchParams.get("page") || "1");
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "0",
  );

  const filters: SQLWrapper[] = [];

  const baseQuery = db
    .select({ festival: festivals, country: countriesTable })
    .from(festivalsToCategoriesTable)
    .innerJoin(
      festivals,
      eq(festivalsToCategoriesTable.festivalId, festivals.id),
    )
    .leftJoin(countriesTable, eq(festivals.countryId, countriesTable.id))
    .leftJoin(
      categories,
      eq(festivalsToCategoriesTable.categoryId, categories.id),
    )
    .$dynamic();

  filters.push(eq(festivals.publish, true));

  if (rangeDateFrom || rangeDateTo) {
    filters.push(
      gte(festivals.createdAt, new Date(Number(rangeDateFrom) * 1000)),
      lte(festivals.createdAt, new Date(Number(rangeDateTo) * 1000)),
    );
  }

  if (categoriesIn.length) {
    filters.push(inArray(categories.slug, categoriesIn));
  }

  if (countryId) {
    filters.push(eq(festivals.countryId, countryId));
  }

  if (search) {
    filters.push(ilike(festivals.name, `%${search}%`));
  }

  baseQuery
    .where(and(...filters))
    .groupBy(festivals.id, countriesTable.id)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const result = await baseQuery;

  return Response.json(result);
}
