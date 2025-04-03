import { forwardRef, useMemo, ButtonHTMLAttributes } from "react";
import { useTranslations, useLocale } from "next-intl";

import { CategoriesType } from "@/db/queries/categories";

import { TreeSelect } from "./tree-select/select";
import { MultiSelectProps } from "../ui/multi-select";
import { groupCategories } from "@/lib/utils";
import { Locale } from "@/i18n/config";

interface CategoriesSelectProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  categories: CategoriesType;
  categoryType: "groups" | "festivals";
  handleChange: MultiSelectProps["onValueChange"];
  isLoading: boolean;
}

export const CategoriesSelect = forwardRef<
  HTMLButtonElement,
  CategoriesSelectProps
>((props, ref) => {
  const { categories, categoryType, isLoading, handleChange, defaultValue = [] } =
    props;
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const categoryOptions = useMemo(() => groupCategories(categories, categoryType, locale, t),
    [categories, locale, t, categoryType]
  );

  return (
    <TreeSelect
      ref={ref}
      placeholder={t("filters.selectCategories")}
      variant="default"
      disabled={isLoading}
      onValueChange={handleChange}
      options={categoryOptions}
      allowSelectAll={false}
      defaultValue={defaultValue as string[]}
    />
  );
});

CategoriesSelect.displayName = "TreeSelect";
