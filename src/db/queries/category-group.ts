import { db } from "@/db";
import { categoryGroups, SelectCategory } from "@/db/schema";
import { inArray } from "drizzle-orm";

export type CategoryGroupWithCategories = {
  name: string;
  slug: string;
  title: string;
  categories: SelectCategory[];
};

export async function getCategoryGroupsWithCategories() {
  return db.query.categoryGroups.findMany({
    where: inArray(categoryGroups.slug, [
      "type-of-festival",
      "age-of-participants",
      "style-of-festival",
      "type-of-accomodation",
    ]),
    with: {
      categories: true,
    },
  });
}

export async function getCategoryGroupsInGroups() {
  return db.query.categoryGroups.findMany({
    where: inArray(categoryGroups.slug, [
      "type-of-festival",
      "age-of-participants",
      "style-of-festival",
      "type-of-accomodation",
    ]),
    with: {
      categories: true,
    },
  });
}
