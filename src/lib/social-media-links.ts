"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { socialMediaLinks } from "@/db/schema";
import { SocialMedialLink } from "@/db/queries/social-media-links";

export async function createSocialMediaLink(
  socialLink: Pick<
    SocialMedialLink,
    "facebookLink" | "instagramLink" | "websiteLink"
  >
) {
  return db.transaction(async (tx) => {
    return await tx.insert(socialMediaLinks).values(socialLink).returning();
  });
}

export async function deleteSocialMediaLink(socialMediaLinkId: number) {
  return db.transaction(async (tx) => {
    await tx
      .delete(socialMediaLinks)
      .where(eq(socialMediaLinks.id, socialMediaLinkId));
  });
}

export async function updateSocialMediaLink(
  SocialMediaLinkId: number,
  socialMedia: Pick<
    SocialMedialLink,
    | "facebookLink"
    | "instagramLink"
    | "websiteLink"
    | "xLink"
    | "tiktokLink"
    | "youtubeLink"
  >
) {
  if (!SocialMediaLinkId) return;

  return db.transaction(async (tx) => {
    await tx
      .update(socialMediaLinks)
      .set(socialMedia)
      .where(eq(socialMediaLinks.id, SocialMediaLinkId));
  });
}
