"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SelectedMenuLang, TabOptions } from "@/types/customization";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Locale } from "@/i18n/config";
import { CategoriesType } from "@/db/queries/categories";
import { SocialMedialLinks } from "@/db/queries/social-media-links";

import MenuTab from "./menu/menu-tab";
import CategoriesTab from "./categories/categories-tab";
import SocialMediaTab from "./socialMediaLinks/social-media-tab";
import BannerTab from "./banner/banner-tab";
import { DesignListType } from "@/db/queries/design";

export interface TabsComponentProps {
  currentTab: TabOptions;
  menu?: SelectedMenuLang[];
  categories?: CategoriesType;
  socialLinks?: SocialMedialLinks;
  banner?: DesignListType;
}

function TabsComponent({
  currentTab,
  menu,
  categories,
  socialLinks,
  banner,
}: TabsComponentProps) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const translations = useTranslations("customization");

  const handleTabChange = useCallback(
    async (value: string) => router.push(`?tab=${value}`),
    [router]
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
      </TabsList>
      <TabsContent value="timeline">
        <Card>
          <CardHeader>
            <CardTitle>{translations("tabs.timeline")}</CardTitle>
            <CardDescription>
              {translations("timeline.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>carousel</CardContent>
        </Card>
      </TabsContent>
      <BannerTab banner={banner ?? []} locale={locale} />
      <MenuTab locale={locale} menu={menu ?? []} />
      <CategoriesTab locale={locale} categories={categories ?? []} />
      <SocialMediaTab socialLinks={socialLinks} />
    </Tabs>
  );
}

export default TabsComponent;
