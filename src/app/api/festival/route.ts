import { buildFestival } from "@/db/queries/events";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "0"
  );

  if (!countryId) {
    return Response.json({ results: [] });
  }

  const results = await buildFestival(countryId);

  return Response.json({ results });
}
