"use client";

import { useMemo, forwardRef } from "react";
import { useTranslations } from "next-intl";

import { SelectCountries } from "@/db/schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface CountrySelectProps {
  handleChange: (value: string) => void;
  countries: SelectCountries[];
  value?: string;
}

const CountrySelect = forwardRef<HTMLDivElement, CountrySelectProps>(
  ({ handleChange, countries = [], value }, ref) => {
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
      <Select onValueChange={handleChange} value={value}>
        <SelectTrigger
          ref={ref as React.Ref<HTMLButtonElement>}
          className="w-full"
        >
          <SelectValue placeholder={t("countrySelect")} />
        </SelectTrigger>
        <SelectContent>{items}</SelectContent>
      </Select>
    );
  }
);

CountrySelect.displayName = "CountrySelect";

export { CountrySelect };
