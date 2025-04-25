import { getAllCountryCastNationalSections } from "@/db/queries/national-sections";
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

  const result = await getAllCountryCastNationalSections(
    locale as Locale,
    regionsIn,
    search,
    countriesIn
  );

  return NextResponse.json(result);
}
