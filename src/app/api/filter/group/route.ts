import {
  categories,
  countries,
  countriesLang,
  events,
  festivals,
  festivalsLang,
  festivalToCategories,
  groupCoverPhotos,
  groups,
  groupsLang,
  groupToCategories,
  languages,
  SelectCountries,
  SelectCountryLang,
  SelectEvent,
  SelectFestival,
  SelectFestivalLang,
  SelectGroup,
  SelectGroupLang,
  SelectStorage,
  storages,
} from "@/db/schema";
import { db } from "@/db";
import {
  aliasedTable,
  and,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  SQLWrapper,
} from "drizzle-orm";
import { NextRequest } from "next/server";
import { defaultLocale, Locale } from "@/i18n/config";

const logoStorage = aliasedTable(storages, "logo");
const coverStorage = aliasedTable(storages, "cover");

export type BuildGroupFilterType = Awaited<ReturnType<typeof buildFilter>>;

async function buildFilter(request: NextRequest) {
  const categoriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("categories") || "[]"
  );
  const countriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("countries") || "[]"
  );
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const type: string = request.nextUrl.searchParams.get("type") || "";
  const rangeDateFrom: string =
    request.nextUrl.searchParams.get("rangeDateFrom") || "";
  const rangeDateTo: string =
    request.nextUrl.searchParams.get("rangeDateTo") || "";
  const page: number = Number(request.nextUrl.searchParams.get("page") || "1");
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "0"
  );
  const groupId: number = Number(
    request.nextUrl.searchParams.get("groupId") || "0"
  );
  const pageSize: number = Number(
    request.nextUrl.searchParams.get("pageSize") || "10"
  );
  const locale: Locale =
    (request.nextUrl.searchParams.get("locale") as Locale) || defaultLocale;
  const regionsIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("regions") || "[]"
  );

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const baseQuery = db
    .select({
      group: groups,
      lang: groupsLang,
      country: countries,
      countryLang: countriesLang,
      logo: logoStorage,
      cover: coverStorage,
    })
    .from(groups)
    .leftJoin(groupToCategories, eq(groupToCategories.groupId, groups.id))
    .leftJoin(groupsLang, eq(groups.id, groupsLang.groupId))
    .leftJoin(countries, eq(groups.countryId, countries.id))
    .leftJoin(countriesLang, eq(countriesLang.countryId, countries.id))
    .leftJoin(categories, eq(groupToCategories.categoryId, categories.id))
    .leftJoin(logoStorage, eq(groups.logoId, logoStorage.id))
    .leftJoin(coverStorage, eq(groups.coverPhotoId, coverStorage.id))
    .$dynamic();

  // filters.push(eq(festivals.publish, true));
  filters.push(isNotNull(groups.countryId));
  filters.push(eq(countriesLang.lang, sq));
  filters.push(eq(groupsLang.lang, sq));

  // if (rangeDateFrom || rangeDateTo) {
  //   filters.push(
  //     gte(events.startDate, new Date(Number(rangeDateFrom) * 1000)),
  //     lte(
  //       events.endDate,
  //       new Date(Number(rangeDateTo || rangeDateFrom) * 1000),
  //     ),
  //   );
  // } else {
  //   filters.push(gte(events.startDate, new Date()));
  // }

  if (categoriesIn.length) {
    filters.push(inArray(categories.id, categoriesIn.map(Number)));
  }

  if (countriesIn.length && !countryId) {
    filters.push(inArray(groups.countryId, countriesIn.map(Number)));
  }

  if (countryId) {
    filters.push(eq(groups.countryId, countryId));
  }

  if (groupId) {
    filters.push(eq(groups.id, groupId));
  }

  if (search) {
    filters.push(ilike(groupsLang.name, `%${search}%`));
  }

  if (regionsIn?.length)
    filters.push(inArray(countries.regionId, regionsIn.map(Number)));

  baseQuery
    .where(and(...filters))
    .groupBy(
      groups.id,
      groupsLang.id,
      countries.id,
      countriesLang.id,
      logoStorage.id,
      coverStorage.id
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const result = await (
    await baseQuery
  ).reduce<
    Promise<
      Record<
        number,
        {
          group: SelectGroup;
          country: SelectCountries | null;
          lang: SelectGroupLang;
          countryLang: SelectCountryLang;
          logo: SelectStorage;
          cover: SelectStorage;
          coverPhotos: { photoId: number | null; url: string | null }[];
        }
      >
    >
  >(async (acc, row) => {
    const record = await acc;

    const group = row.group;
    const country = row.country;
    const lang = row.lang;
    const countryLang = row.countryLang;
    const logo = row.logo;
    const cover = row.cover;

    if (!record[group.id]) {
      const coverPhotos = await db
        .select({
          photoId: groupCoverPhotos.photoId,
          url: storages.url,
        })
        .from(groupCoverPhotos)
        .leftJoin(storages, eq(groupCoverPhotos.photoId, storages.id))
        .where(eq(groupCoverPhotos.groupId, group.id));

      record[group.id] = {
        group,
        country,
        lang: lang!,
        countryLang: countryLang!,
        logo: logo!,
        cover: cover!,
        coverPhotos: coverPhotos ?? [],
      };
    }

    return record;
  }, Promise.resolve({}));

  return Object.values(result);
}

export async function GET(request: NextRequest) {
  const result = await buildFilter(request);
  return Response.json(result);
}
