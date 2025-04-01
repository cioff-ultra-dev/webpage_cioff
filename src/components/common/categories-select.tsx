import { forwardRef, useMemo, ButtonHTMLAttributes } from "react";
import { useTranslations, useLocale } from "next-intl";
import groupBy from "object.groupby";

import { CategoriesType } from "@/db/queries/categories";
import { TreeNode } from "@/types/tree-select";

import { TreeSelect } from "./tree-select/select";
import { MultiSelectProps } from "../ui/multi-select";
import { groupCategories } from "@/lib/utils";
import { Locale } from "@/i18n/config";

const FESTIVAL_CATEGORY_MAP = {
  music: "typeOfFestival",
  dance: "typeOfFestival",
  "dance-music": "typeOfFestival",
  "youth-adults": "ageParticipants",
  seniors: "ageParticipants",
  "teenagers-children": "ageParticipants",
  mixed: "ageParticipants",
  authentic: "styleOfFestival",
  elaborado: "styleOfFestival",
  stylized: "styleOfFestival",
  cioff: "status",
  international: "status",
  "host-families": "typeOfAccomodation",
  "hotel-hostel-campus": "typeOfAccomodation",
  "schools-gym-halls": "typeOfAccomodation",
};

const GROUP_CATEGORY_MAP = {
  music: "groupType",
  dance: "groupType",
  "dance-music": "groupType",
  "youth-adults": "groupAge",
  seniors: "groupAge",
  "teenagers-children": "groupAge",
  authentic: "styleGroup",
  elaborado: "styleGroup",
  stylized: "styleGroup",
};

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
