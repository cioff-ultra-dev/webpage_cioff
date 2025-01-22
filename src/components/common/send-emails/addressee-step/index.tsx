import { JSX, useMemo, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { MultiSelectProps } from "@/components/ui/multi-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesType } from "@/db/queries/categories";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SelectFestival } from "@/db/schema";
import { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import fetcher from "@/lib/utils";
import { RegionsType } from "@/db/queries/regions";
import { Action, State } from "@/types/send-email";

import NationalSectionTab from "./national-sections-tab";
import UserTab from "./user-tab";
import FestivalTab from "./festival-tab";
import GroupTab from "./group-tab";

interface AddresseeStepProps {
  locale: Locale;
  festivals: { festivals: SelectFestival }[];
  countries: CountryCastFestivals;
  categories: CategoriesType;
  handleNextStep: (step: number) => void;
  dispatch: (action: Action) => void;
  addresseeIds: State;
}

function AddresseeStep(props: AddresseeStepProps): JSX.Element {
  const { categories, handleNextStep, locale, dispatch, addresseeIds } = props;
  const [tabSelected, setTabSelected] = useState<string>("festivals");

  const translations = useTranslations("sendEmails");

  const { data: regions = [], isLoading: isLoadingRegion } =
    useSWR<RegionsType>(`/api/filter/region?locale=${locale}`, fetcher);

  const categoriesMap: MultiSelectProps["options"] = useMemo(() => {
    return categories.map((category) => {
      return {
        label: category.langs.at(0)?.name || category.slug,
        value: String(category.id),
      };
    });
  }, [categories]);

  const regionsMap: MultiSelectProps["options"] = useMemo(() => {
    return regions.map((region) => {
      return {
        label:
          region.langs.find((item) => item.l?.code === locale)?.name ||
          region.langs.at(0)?.name ||
          region.slug,
        value: String(region.id),
      };
    });
  }, [regions, locale]);

  const currentTab = useMemo(() => {
    switch (tabSelected) {
      case "festivals":
        return (
          <FestivalTab
            categories={categoriesMap}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedFestivals={addresseeIds.festivals}
          />
        );
      case "groups":
        return (
          <GroupTab
            categories={categoriesMap}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedGroups={addresseeIds.groups}
          />
        );
      case "national_section":
        return (
          <NationalSectionTab
            categories={categoriesMap}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedSections={addresseeIds.nationalSections}
          />
        );
      case "council":
        return (
          <UserTab
            categories={categoriesMap}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedUsers={addresseeIds.users}
          />
        );
    }
  }, [
    tabSelected,
    categoriesMap,
    regionsMap,
    isLoadingRegion,
    locale,
    dispatch,
    addresseeIds,
  ]);

  return (
    <div>
      <Tabs
        defaultValue="festivals"
        value={tabSelected}
        className="w-full"
        onValueChange={(value) => setTabSelected(value)}
      >
        <div className="container mx-auto flex">
          <TabsList className="">
            <TabsTrigger value="festivals">
              {translations("festivals")}
            </TabsTrigger>
            <TabsTrigger value="groups">{translations("groups")}</TabsTrigger>
            <TabsTrigger value="national_section">
              {translations("nationalSections")}
            </TabsTrigger>
            <TabsTrigger value="council">{translations("council")}</TabsTrigger>
          </TabsList>
        </div>
        {currentTab}
      </Tabs>

      <div className="w-full flex justify-end mt-4">
        <Button
          type="submit"
          className="space-y-0"
          disabled={
            !Object.values(addresseeIds).some((values) => values.length > 0)
          }
          onClick={() => handleNextStep(1)}
        >
          {translations("next")}
        </Button>
      </div>
    </div>
  );
}

export default AddresseeStep;
