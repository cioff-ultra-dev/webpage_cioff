import {
  categories,
  countriesTable,
  festivals,
  festivalsToCategoriesTable,
} from "@/db/schema";
import { db } from "@/db";
import { and, asc, eq, gte, ilike, inArray, lte } from "drizzle-orm";
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

  const baseQuery = db
    .select({ festival: festivals, country: countriesTable })
    .from(festivalsToCategoriesTable)
    .innerJoin(
      festivals,
      eq(festivalsToCategoriesTable.festivalId, festivals.id),
    )
    .innerJoin(countriesTable, eq(festivals.countryId, countriesTable.id))
    .leftJoin(
      categories,
      eq(festivalsToCategoriesTable.categoryId, categories.id),
    )
    .groupBy(festivals.id, countriesTable.id)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE)
    .$dynamic();

  if (rangeDateFrom || rangeDateTo) {
    baseQuery.where(
      and(
        gte(festivals.createdAt, new Date(Number(rangeDateFrom) * 1000)),
        lte(festivals.createdAt, new Date(Number(rangeDateTo) * 1000)),
      ),
    );
  }

  if (categoriesIn.length) {
    baseQuery.where(inArray(categories.slug, categoriesIn));
  }

  if (search) {
    baseQuery.where(ilike(festivals.name, `%${search}%`));
  }

  const result = await baseQuery;

  return Response.json(result);
}
