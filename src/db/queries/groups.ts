import { auth } from "@/auth";
import { db } from "@/db";
import {
  categories,
  countries,
  countriesLang,
  groups,
  groupToCategories,
  languages,
  SelectGroup,
  SelectLanguages,
  groupsLang,
} from "@/db/schema";
import { defaultLocale, Locale } from "@/i18n/config";
import {
  and,
  countDistinct,
  eq,
  ilike,
  inArray,
  sql,
  SQLWrapper,
} from "drizzle-orm";
import { getLocale } from "next-intl/server";

const preparedLanguagesByCode = db.query.languages
  .findFirst({
    where: (languages, { eq }) => eq(languages.code, sql.placeholder("locale")),
  })
  .prepare("query_language_by_code");

export async function getAllGroups() {
  return db.query.groups.findMany({
    with: {
      country: true,
    },
  });
}

export type AllGroupType = Awaited<ReturnType<typeof getAllGroups>>;

export async function getGroupById(id: SelectGroup["id"]) {
  const locale = await getLocale();
  const localeValue = locale as SelectLanguages["code"];
  const currentDefaultLocale = defaultLocale as SelectLanguages["code"];

  const pushLocales = [localeValue];

  if (localeValue !== currentDefaultLocale) {
    pushLocales.push(currentDefaultLocale);
  }

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(inArray(languages.code, pushLocales));

  return db.query.groups.findFirst({
    where: eq(groups.id, id),
    with: {
      directorPhoto: true,
      musicalPhoto: true,
      artisticPhoto: true,
      coverPhoto: true,
      logo: true,
      photos: {
        with: {
          photo: true,
        },
      },
      owners: {
        with: {
          user: true,
        },
      },
      subgroups: {
        with: {
          subgroupsToCategories: {
            with: {
              category: {
                with: {
                  langs: {
                    where(fields, { inArray }) {
                      return inArray(fields.lang, sq);
                    },
                    with: {
                      l: true,
                    },
                  },
                },
              },
            },
          },
          langs: {
            where(fields, { inArray }) {
              return inArray(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      repertories: {
        with: {
          langs: {
            where(fields, { inArray }) {
              return inArray(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      groupToCategories: {
        with: {
          category: {
            with: {
              langs: {
                where(fields, { inArray }) {
                  return inArray(fields.lang, sq);
                },
                with: {
                  l: true,
                },
              },
            },
          },
        },
      },
      langs: {
        where(fields, { inArray }) {
          return inArray(fields.lang, sq);
        },
        with: {
          l: true,
        },
      },
      specificRegion: {
        with: {
          langs: {
            where(fields, { inArray }) {
              return inArray(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      coverPhotos: {
        with: {
          photo: true,
        },
      },
      festivalsToGroups: {
        with: {
          festival: {
            with: {
              langs: {
                with: {
                  l: true,
                },
              },
              country: {
                with: {
                  langs: {
                    with: {
                      l: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      reportsFromFestivals: {
        with: {
          answers: true,
          report: {
            with: {
              fesival: {
                with: {
                  logo: true,
                  langs: {
                    where(fields, { inArray }) {
                      return inArray(fields.lang, sq);
                    },
                    with: {
                      l: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export type GroupDetailsType = Awaited<ReturnType<typeof getGroupById>>;

export async function getAllGroupsByOwner(locale: string) {
  const session = await auth();
  const localeValue = locale as SelectLanguages["code"];
  const currentDefaultLocale = defaultLocale as SelectLanguages["code"];

  const pushLocales = [localeValue];

  if (localeValue !== currentDefaultLocale) {
    pushLocales.push(currentDefaultLocale);
  }

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(inArray(languages.code, pushLocales));

  return db.query.owners.findMany({
    where(fields, { eq }) {
      return eq(fields.userId, session?.user.id!);
    },
    with: {
      ns: {
        with: {
          groups: {
            with: {
              country: {
                with: {
                  langs: {
                    where(fields, { inArray }) {
                      return inArray(fields.lang, sq);
                    },
                    with: {
                      l: true,
                    },
                  },
                },
              },
              owners: {
                with: {
                  user: true,
                },
              },
              langs: {
                where(fields, { inArray }) {
                  return inArray(fields.lang, sq);
                },
                with: {
                  l: true,
                },
              },
            },
          },
        },
      },
      group: {
        with: {
          owners: {
            with: {
              user: true,
            },
          },
          langs: {
            where(fields, { inArray }) {
              return inArray(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
          country: {
            with: {
              langs: {
                where(fields, { inArray }) {
                  return inArray(fields.lang, sq);
                },
                with: {
                  l: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export type GroupByOwnerType = Awaited<ReturnType<typeof getAllGroupsByOwner>>;

export async function getAllTypeOfGroups() {
  const locale = await getLocale();
  const lang = await preparedLanguagesByCode.execute({ locale });
  return db.query.categories.findMany({
    where(fields, operators) {
      return operators.inArray(fields.slug, ["music", "dance"]);
    },
    with: {
      langs: {
        where(fields, operators) {
          return operators.eq(fields.lang, lang?.id!);
        },
      },
    },
  });
}

export type TypeOfGroupType = Awaited<ReturnType<typeof getAllTypeOfGroups>>;

export async function getAllAgeGroups() {
  const locale = await getLocale();
  const lang = await preparedLanguagesByCode.execute({ locale });
  return db.query.categories.findMany({
    where(fields, operators) {
      return operators.inArray(fields.slug, [
        "teenagers-children",
        "youth-adults-seniors",
      ]);
    },
    with: {
      langs: {
        where(fields, operators) {
          return operators.eq(fields.lang, lang?.id!);
        },
      },
    },
  });
}

export type AgeGroupsType = Awaited<ReturnType<typeof getAllAgeGroups>>;

export async function getAllGroupStyles() {
  const locale = await getLocale();
  const lang = await preparedLanguagesByCode.execute({ locale });
  return db.query.categories.findMany({
    where(fields, operators) {
      return operators.inArray(fields.slug, [
        "authentic",
        "elaborate",
        "stylized",
      ]);
    },
    with: {
      langs: {
        where(fields, operators) {
          return operators.eq(fields.lang, lang?.id!);
        },
      },
    },
  });
}

export type GroupStyleType = Awaited<ReturnType<typeof getAllAgeGroups>>;

export async function buildGroup(countryId: number) {
  return await db.query.groups.findMany({
    where(fields, { eq }) {
      return eq(fields.countryId, countryId);
    },
    with: {
      country: {
        with: {
          langs: {
            with: {
              l: true,
            },
          },
        },
      },
      langs: {
        with: {
          l: true,
        },
      },
    },
  });
}

export type CountryCastGroups = {
  id: number;
  country: string | null;
  lat: string | null;
  lng: string | null;
  name: string | null;
  location: string | null;
  countryId: number | null;
}[];

export async function getAllCountryCastGroups(
  locale: Locale,
  regionsIn: string[] = [],
  search?: string,
  countriesIn?: string[],
  categoriesIn?: string[]
): Promise<CountryCastGroups> {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const query = db
    .select({
      id: groups.id,
      country: countriesLang.name,
      countryId: countries.id,
      lat: groups.lat,
      lng: groups.lng,
      location: groups.location,
      name: groupsLang.name,
    })
    .from(groups)
    .leftJoin(groupsLang, eq(groups.id, groupsLang.groupId))
    .leftJoin(countriesLang, eq(groups.countryId, countriesLang.countryId))
    .leftJoin(countries, eq(countries.id, groups.countryId))
    .leftJoin(groupToCategories, eq(groupToCategories.groupId, groups.id))
    .leftJoin(categories, eq(groupToCategories.categoryId, categories.id))
    .$dynamic();

  filters.push(
    // isNotNull(festivals.countryId),
    eq(countriesLang.lang, sq),
    eq(groupsLang.lang, sq)
  );

  if (regionsIn.length)
    filters.push(inArray(countries.regionId, regionsIn.map(Number)));

  if (search) filters.push(ilike(groupsLang.name, `%${search}%`));

  if (categoriesIn?.length)
    filters.push(inArray(categories.id, categoriesIn.map(Number)));

  if (countriesIn?.length)
    filters.push(inArray(groups.countryId, countriesIn.map(Number)));

  query
    .where(and(...filters))
    .groupBy(countries.id, groups.id, groupsLang.id, countriesLang.id)
    .orderBy(countries.slug);
  console.log(query.toSQL().sql, query.toSQL().params);
  return query;
}
