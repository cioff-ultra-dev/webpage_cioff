import { db } from "@/db";

export async function getAllSocialMediaLinks() {
  return db.query.socialMediaLinks.findMany({});
}

export type SocialMedialLinks = Awaited<
  ReturnType<typeof getAllSocialMediaLinks>
>;
export type SocialMedialLink = Awaited<
  ReturnType<typeof getAllSocialMediaLinks>
>[0];
