import { getAllCountryCastGroups } from "@/db/queries/groups";
import { defaultLocale, Locale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? defaultLocale;
  const regionsIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("regions") || "[]",
  );

  const result = await getAllCountryCastGroups(locale as Locale, regionsIn);

  return NextResponse.json(result);
}
