import { getAllRegions } from "@/db/queries/regions";
import { defaultLocale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? defaultLocale;

  const result = await getAllRegions();

  return NextResponse.json(result);
}
