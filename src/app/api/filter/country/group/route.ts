import { getAllCountryCastGroups } from "@/db/queries/groups";
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

  const result = await getAllCountryCastGroups(
    locale as Locale,
    regionsIn,
    search,
    countriesIn
  );

  return NextResponse.json(result);
}
