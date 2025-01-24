import { asc } from "drizzle-orm";

import { db } from "@/db";

export async function getFirstSocialMediaLink() {
  return db.query.socialMediaLinks.findFirst({
    orderBy: (fields) => asc(fields.id),
  });
}

export type SocialMedialLink = Exclude<
  Awaited<ReturnType<typeof getFirstSocialMediaLink>>,
  undefined
>;
