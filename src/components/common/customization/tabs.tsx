"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SelectedMenuLang, TabOptions } from "@/types/customization";
import { Locale } from "@/i18n/config";
import { CategoriesType } from "@/db/queries/categories";
import { SocialMedialLink } from "@/db/queries/social-media-links";

import MenuTab from "./menu/menu-tab";
import CategoriesTab from "./categories/categories-tab";
import SocialMediaTab from "./socialMediaLinks/social-media-tab";
import BannerTab from "./banner/banner-tab";
import TimelineTab from "./timeline/timeline-tab";
import { DesignListType } from "@/db/queries/design";
import { TimelineType } from "@/db/queries/timeline";
import { RatingQuestionsType, ReportRatingType } from "@/db/queries/reports";
import ReportQuestionsTab from "./reportQuestions/report-questions-tab";

export interface TabsComponentProps {
  currentTab: TabOptions;
  menu?: SelectedMenuLang[];
  categories?: CategoriesType;
  socialLink?: SocialMedialLink;
  banner?: DesignListType;
  timeline?: TimelineType;
  ratingTypes?: ReportRatingType;
  ratingQuestions?: RatingQuestionsType;
}

function TabsComponent({
  currentTab,
  menu,
  categories,
  socialLink,
  banner,
  timeline,
  ratingTypes,
  ratingQuestions,
}: TabsComponentProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const translations = useTranslations("customization");

  const handleTabChange = useCallback(
    async (value: string) => router.push(`?tab=${value}`),
    [router],
  );

  return (
    <Tabs defaultValue={currentTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="banner">{translations("tabs.banner")}</TabsTrigger>
        <TabsTrigger value="menu">{translations("tabs.menu")}</TabsTrigger>
        <TabsTrigger value="social-networks">
          {translations("tabs.network")}
        </TabsTrigger>
        <TabsTrigger value="categories">
          {translations("tabs.categories")}
        </TabsTrigger>
        <TabsTrigger value="timeline">
          {translations("tabs.timeline")}
        </TabsTrigger>
        <TabsTrigger value="report-questions">
          {translations("tabs.reportQuestions")}
        </TabsTrigger>
      </TabsList>
      <TimelineTab timeline={timeline} locale={locale} />
      <BannerTab banner={banner ?? []} locale={locale} />
      <MenuTab locale={locale} menu={menu ?? []} />
      <CategoriesTab locale={locale} categories={categories ?? []} />
      <SocialMediaTab socialLink={socialLink} />
      <ReportQuestionsTab
        locale={locale}
        ratingTypes={ratingTypes ?? []}
        ratingQuestions={ratingQuestions ?? []}
      />
    </Tabs>
  );
}

export default TabsComponent;
