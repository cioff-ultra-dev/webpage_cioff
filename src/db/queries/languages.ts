import { db } from "@/db";

export async function getAllLanguages() {
  return db.query.languages.findMany();
}

export type LanguagesType = Awaited<ReturnType<typeof getAllLanguages>>;
