import { db } from "@/db";
import { categoryGroups, roles } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const t = await getTranslations("notification");
  const email: string = request.nextUrl.searchParams.get("email") || "";
  const festivalId: number = Number(
    request.nextUrl.searchParams.get("festivalId") || ""
  );
  const roleName: string = request.nextUrl.searchParams.get("roleName") || "";

  const checkEmail = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.email, email);
    },
  });

  if (checkEmail) {
    return { error: t("email_exist") };
  }

  await db.transaction(async (tx) => {
    const role = await tx.query.roles.findFirst({
      where: eq(roles.name, roleName),
    });
  });

  return Response.json({ email, festivalId, roleName });
}
