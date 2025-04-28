"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Instagram, Link as LinkComponent } from "lucide-react";

import {
  getFirstSocialMediaLink,
  SocialMedialLink,
} from "@/db/queries/social-media-links";
import X from "@/components/common/icons/x";
import Tiktok from "@/components/common/icons/tiktok";
import Youtube from "@/components/common/icons/youtube";
import Facebook from "@/components/common/icons/facebook";

import { Button } from "../ui/button";

function Footer() {
  const [socialLink, setSocialLink] = useState<SocialMedialLink>(
    {} as SocialMedialLink
  );
  const t = useTranslations("footer");

  useEffect(() => {
    async function getSocialLinks() {
      const response = await getFirstSocialMediaLink();

      setSocialLink(response!);
    }

    getSocialLinks();
  }, []);

  return (
    <footer className="bg-primary py-4 sm:py-8 text-white flex justify-center">
      <div className="grid grid-cols-2 max-md:grid-cols-1 text-roboto w-2/5 max-md:w-full">
        <section className="flex flex-col max-sm:items-center">
          <p className="text-lg">{t("connect")}</p>
          <Link href="mailto:info@cioff.org" className="text-md my-4 hover:underline hover:underline-offset-2">
            info@cioff.org
          </Link>
          <p>
            CIOFF<span className="text-sm align-top">®</span>
          </p>
          <p>{t("place")}</p>
          <p>{t("address")}</p>
          <p>{t("additional")}</p>
          <p>{t("country")}</p>
        </section>
        <section className="flex flex-col items-center max-sm:my-6">
          <Link href="mailto:legal@cioff.org" className="h-min">
            <Button className="text-lg hover:bg-white hover:text-primary border border-white">
              {t("become")}
            </Button>
          </Link>
          <div className="flex justify-center items-center space-x-2 gap-6 mt-4">
            {socialLink?.facebookLink && (
              <Link href={socialLink?.facebookLink} target="_blank">
                <Facebook className="w-6 h-6 fill-white" />
              </Link>
            )}
            {socialLink?.instagramLink && (
              <Link href={socialLink?.instagramLink} target="_blank">
                <Instagram className="w-6 h-6 text-white" />
              </Link>
            )}
            {socialLink?.youtubeLink && (
              <Link href={socialLink?.youtubeLink} target="_blank">
                <Youtube className="w-8 h-8 fill-white" />
              </Link>
            )}
            {socialLink?.xLink && (
              <Link href={socialLink?.xLink} target="_blank">
                <X className="w-6 h-6 fill-white" />
              </Link>
            )}
            {socialLink?.tiktokLink && (
              <Link href={socialLink?.tiktokLink} target="_blank">
                <Tiktok className="w-6 h-6 fill-white" />
              </Link>
            )}
            {socialLink?.websiteLink && (
              <Link href={socialLink?.websiteLink} target="_blank">
                <LinkComponent className="w-6 h-6 text-white" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
