import { getAllCountryCastFestivals } from "@/db/queries/countries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const result = await getAllCountryCastFestivals();

  return NextResponse.json(result);
}
