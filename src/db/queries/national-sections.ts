import { auth } from "@/auth";
import { db } from "@/db";
import {
  NationalSectionLangProd,
  NationalSectionProd,
  SelectNationalSection,
  SelectNationalSectionLang,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export type LangWithNationalSection = SelectNationalSection & {
  langs: SelectNationalSectionLang[];
};

export async function getAllNationalSections(): Promise<
  LangWithNationalSection[]
> {
  const session = await auth();
  return db.query.NationalSectionProd.findMany({
    where: and(
      eq(NationalSectionProd.countryId, session?.user.countryId!),
      eq(NationalSectionProd.ownerId, session?.user.id!)
    ),
    with: {
      langs: {
        where: eq(NationalSectionLangProd.lang, 1),
      },
    },
  });
}
