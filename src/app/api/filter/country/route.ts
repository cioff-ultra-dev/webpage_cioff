import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { defaultLocale, Locale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? defaultLocale;
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const regionsIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("regions") || "[]"
  );
  const countriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("countries") || "[]"
  );
  const categoriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("categories") || "[]"
  );
  const rangeDateFrom: string =
    request.nextUrl.searchParams.get("rangeDateFrom") || "";
  const rangeDateTo: string =
    request.nextUrl.searchParams.get("rangeDateTo") || "";

  const result = await getAllCountryCastFestivals(
    locale as Locale,
    regionsIn,
    search,
    countriesIn,
    categoriesIn,
    rangeDateFrom,
    rangeDateTo
  );

  return NextResponse.json(result);
}
