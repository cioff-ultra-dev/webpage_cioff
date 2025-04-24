import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import useSWR from "swr";

import { MultiSelect, MultiSelectProps } from "@/components/ui/multi-select";
import { CountryCastGroups } from "@/db/queries/groups";
import fetcher from "@/lib/utils";

interface CountrySelectProps {
  setCountries: MultiSelectProps["onValueChange"];
  defaultCountries?: string[];
  categoryType: "festivals" | "groups" | "national-sections";
  selectedRegions?: string[];
}

function CountrySelect(props: CountrySelectProps) {
  const {
    setCountries,
    defaultCountries = [],
    categoryType,
    selectedRegions = [],
  } = props;
  const locale = useLocale();
  const t = useTranslations();

  const apiURL = useMemo(() => {
    const params = new URLSearchParams();
    params.append("locale", locale);

    if (selectedRegions.length > 0)
      params.append("regions", JSON.stringify(selectedRegions));

    if (categoryType === "festivals")
      return `/api/filter/country?${params.toString()}`;

    if (categoryType === "groups")
      return `/api/filter/country/group?${params.toString()}`;

    return `/api/filter/country/national-section?${params.toString()}`;
  }, [categoryType, locale, selectedRegions]);

  const { data = [], isLoading } = useSWR<CountryCastGroups>(
    () => apiURL,
    fetcher
  );

  const countries: MultiSelectProps["options"] = useMemo(() => {
    return data
      .filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.countryId === value.countryId)
      )
      .map((country) => {
        return {
          label: country.country || "",
          value: String(country.countryId),
        };
      });
  }, [data]);

  return (
    <MultiSelect
      options={countries}
      onValueChange={setCountries}
      disabled={isLoading}
      placeholder={t("filters.countries")}
      defaultValue={defaultCountries}
    />
  );
}

export default CountrySelect;
