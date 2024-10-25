import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { defaultLocale, Locale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? defaultLocale;

  const result = await getAllCountryCastFestivals(locale as Locale);

  return NextResponse.json(result);
}
