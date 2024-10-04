import { count, eq } from "drizzle-orm";
import { db } from "..";
import { festivals, groups, SelectCountries } from "../schema";

export type CountByCountriesResult = {
  festivalCount: number | undefined;
  groupCount: number | undefined;
};

export async function getFestivalsAndGroupsCounts(
  countryId: SelectCountries["id"]
): Promise<CountByCountriesResult> {
  const allCountsFestivalByCountries = db
    .select({ countFestivals: count() })
    .from(festivals)
    .where(eq(festivals.countryId, countryId));

  const allCountsGroupsByCountries = db
    .select({ countGroups: count() })
    .from(groups)
    .where(eq(groups.countryId, countryId));

  const [festivalResult, groupResults] = await Promise.allSettled([
    allCountsFestivalByCountries,
    allCountsGroupsByCountries,
  ]);

  const festivalCount =
    festivalResult.status === "fulfilled"
      ? festivalResult.value.at(0)?.countFestivals
      : 0;
  const groupCount =
    groupResults.status === "fulfilled"
      ? groupResults.value.at(0)?.countGroups
      : 0;

  return { festivalCount, groupCount };
}
