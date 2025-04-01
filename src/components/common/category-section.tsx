import { JSX } from "react";
import { getTranslations } from "next-intl/server";

import { groupCategories } from "@/lib/utils";
import { Locale } from "@/i18n/config";
import { CategoriesType } from "@/db/queries/categories";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategorySectionProps {
  categories: CategoriesType;
  locale: Locale;
  categoryType: "groups" | "festivals";
}

export async function CategorySection(
  props: CategorySectionProps
): Promise<JSX.Element> {
  const { categories, locale, categoryType } = props;

  const translations = await getTranslations();

  const categoryGroups = groupCategories(
    categories,
    categoryType,
    locale,
    translations
  );

  const items = categoryGroups.map((item) => (
    <div key={item.value}>
      <p className="mb-2">{item.label}</p>
      <div className="flex flex-wrap gap-2">
        {item.children?.map((category) => (
          <Badge key={category.value}>{category.label}</Badge>
        ))}
      </div>
    </div>
  ));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{translations("detailFestivals.categories")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-wrap gap-4 cursor-default">
        {items}
      </CardContent>
    </Card>
  );
}
