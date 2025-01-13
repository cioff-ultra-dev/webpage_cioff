import { db } from "@/db";

export async function getAllSocialMediaLinks() {
  return db.query.socialMediaLinks.findFirst();
}

export type SocialMedialLink = Exclude<
  Awaited<ReturnType<typeof getAllSocialMediaLinks>>,
  undefined
>;
