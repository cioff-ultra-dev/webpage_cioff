"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { SelectCountries } from "@/db/schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function CountrySelect({
  handleChange,
  countries,
}: {
  handleChange: (value: any) => void;
  countries: SelectCountries[];
}) {
  const t = useTranslations("formNews");

  const items = useMemo(
    () =>
      countries.map((item) => (
        <SelectItem
          key={item.id}
          value={String(item.id)}
          className="flex gap-1"
        >
          {item.slug}
        </SelectItem>
      )),
    [countries]
  );

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={t("countrySelect")} />
      </SelectTrigger>
      <SelectContent>{items}</SelectContent>
    </Select>
  );
}

export { CountrySelect };
