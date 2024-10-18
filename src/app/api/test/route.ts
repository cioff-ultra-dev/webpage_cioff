import { Locale } from "@/i18n/config";
import { getTranslateText } from "@/lib/translate";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const text: string | null = request.nextUrl.searchParams.get("text");
  const locale: Locale = "fr";

  if (!text) {
    return Response.json({ results: null });
  }

  const results = await getTranslateText(text, locale);

  return Response.json({ results });
}
