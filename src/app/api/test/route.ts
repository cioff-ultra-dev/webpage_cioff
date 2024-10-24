import { Locale } from "@/i18n/config";
import { getTranslateText } from "@/lib/translate";
import { getLocale } from "next-intl/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const currentLocale = (await getLocale()) as Locale;

  const results = await getTranslateText(
    search || "hola mundo de mierda",
    currentLocale,
  );

  return Response.json({ results });
}
