import { JSX, useMemo, useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";

import { MultiSelectProps } from "@/components/ui/multi-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoriesType } from "@/db/queries/categories";
import { CountryCastFestivals } from "@/db/queries/countries";
import { SelectFestival } from "@/db/schema";
import { Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import fetcher from "@/lib/utils";
import { RegionsType } from "@/db/queries/regions";
import { Action, SearchFormElement, State } from "@/types/send-email";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [search, setSearch] = useState("");

  const translations = useTranslations("sendEmails");
  const tf = useTranslations("filters");

  const { data: regions = [], isLoading: isLoadingRegion } =
    useSWR<RegionsType>(`/api/filter/region?locale=${locale}`, fetcher);

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

  async function handleSubmit(
    event: React.FormEvent<SearchFormElement>
  ): Promise<void> {
    event.preventDefault();

    const searchValue = event.currentTarget.elements?.search.value;

    setSearch(searchValue);
  }

  const currentTab = useMemo(() => {
    switch (tabSelected) {
      case "festivals":
        return (
          <FestivalTab
            categories={categories}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedFestivals={addresseeIds.festivals}
            searchText={search}
            showInputSearch={false}
          />
        );
      case "groups":
        return (
          <GroupTab
            categories={categories}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedGroups={addresseeIds.groups}
            searchText={search}
            showInputSearch={false}
            showIconLabels
          />
        );
      case "national_section":
        return (
          <NationalSectionTab
            categories={categories}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedSections={addresseeIds.nationalSections}
            searchText={search}
            showInputSearch={false}
            showIconLabels
          />
        );
      case "council":
        return (
          <UserTab
            categories={categories}
            regions={regionsMap}
            isRegionLoading={isLoadingRegion}
            locale={locale}
            dispatch={dispatch}
            selectedUsers={addresseeIds.users}
            searchText={search}
            showInputSearch={false}
            showIconLabels
          />
        );
    }
  }, [
    tabSelected,
    categories,
    regionsMap,
    isLoadingRegion,
    locale,
    dispatch,
    addresseeIds,
    search,
  ]);

  return (
    <div>
      <Tabs
        defaultValue="festivals"
        value={tabSelected}
        className="w-full"
        onValueChange={(value) => setTabSelected(value)}
      >
        <div className="container mx-auto flex  gap-4">
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
          <div className="flex-1">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-end space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <Input placeholder={tf("inputSearch")} name="search" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      className="rounded-full"
                    >
                      <SearchIcon className="text-black" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="center" side="bottom">
                    <p>{tf("search")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </form>
          </div>
        </div>
        {currentTab}
      </Tabs>

      <div className="w-full flex justify-end mt-4">
        <Button
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
