import { auth } from "@/auth";
import { db } from "@/db";
import { groups, languages, SelectGroup, SelectLanguages } from "@/db/schema";
import { defaultLocale } from "@/i18n/config";
import { eq, inArray, sql } from "drizzle-orm";
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
      subgroups: {
        with: {
          subgroupsToCategories: true,
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
          category: true,
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
