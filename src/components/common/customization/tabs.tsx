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

import MenuTab from "./menu/menu-tab";
import CategoriesTab from "./categories/categories-tab";

export interface TabsComponentProps {
  currentTab: TabOptions;
  menu?: SelectedMenuLang[];
  categories?: CategoriesType;
}

function TabsComponent({ currentTab, menu, categories }: TabsComponentProps) {
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
      <TabsContent value="banner">
        <Card>
          <CardHeader>
            <CardTitle>{translations("allTitle")}</CardTitle>
            <CardDescription>{translations("allDescription")}</CardDescription>
          </CardHeader>
          <CardContent>MAMA</CardContent>
        </Card>
      </TabsContent>
      <MenuTab locale={locale} menu={menu ?? []} />
      <CategoriesTab locale={locale} categories={categories ?? []} />
      <TabsContent value="social-networks">
        <Card>
          <CardHeader>
            <CardTitle>{translations("draftTitle")}</CardTitle>
            <CardDescription>
              {translations("draftDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>Malo</CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default TabsComponent;
