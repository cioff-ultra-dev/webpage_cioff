import { db } from "@/db";
import { festivals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest) {
  const result = await db.query.festivals.findFirst({
    where: eq(festivals.id, 1),
    with: {
      country: true,
    },
  });

  return NextResponse.json(result);
}
