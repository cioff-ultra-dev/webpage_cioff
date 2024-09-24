import { db } from "@/db";

export async function getAllLanguages() {
  return db.query.LanguagesProd.findMany();
}
