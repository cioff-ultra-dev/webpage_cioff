import { db } from "@/db";
import { categoryGroups, SelectCategory } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { getCategoryForGroups } from "./events";

type CategoryTypeWith = Awaited<ReturnType<typeof getCategoryForGroups>>;

export type CategoryGroupWithCategories = {
  // name: string;
  slug: string;
  title: string;
  categories: CategoryTypeWith;
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
