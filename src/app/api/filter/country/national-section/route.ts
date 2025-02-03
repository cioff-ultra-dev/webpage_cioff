import { getAllCountryCastNationalSections } from "@/db/queries/national-sections";
import { defaultLocale, Locale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? defaultLocale;
  const regionsIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("regions") || "[]"
  );

  const result = await getAllCountryCastNationalSections(
    locale as Locale,
    regionsIn
  );

  return NextResponse.json(result);
}
