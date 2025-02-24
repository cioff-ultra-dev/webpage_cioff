import { count, eq, inArray } from "drizzle-orm";
import { db } from "..";
import {
  festivals,
  groups,
  languages,
  ratingType,
  SelectCountries,
  SelectFestival,
  SelectGroup,
  SelectLanguages,
  SelectNationalSection,
  SelectRatingType,
  SelectUser,
} from "../schema";
import { defaultLocale } from "@/i18n/config";

export type CountByCountriesResult = {
  festivalCount: number | undefined;
  groupCount: number | undefined;
};

export async function getAllReportsNationalSections() {
  return db.query.reportNationalSections.findMany();
}

export type ReportNationalSectionsType = Awaited<
  ReturnType<typeof getAllReportsNationalSections>
>;

export async function getReportsFestivals(id: SelectFestival["id"]) {
  return db.query.reportFestival.findMany({
    where(fields, { eq }) {
      return eq(fields.festivalId, id);
    },
  });
}

export type ReportFestivalsType = Awaited<
  ReturnType<typeof getReportsFestivals>
>;

export async function getReportsGroups(id: SelectGroup["id"]) {
  return db.query.reportGroup.findMany({
    where(fields, { eq }) {
      return eq(fields.groupId, id);
    },
  });
}

export type ReportGroupsType = Awaited<ReturnType<typeof getReportsGroups>>;

export async function getReportsNationalSections(
  id: SelectNationalSection["id"]
) {
  return db.query.reportNationalSections.findMany({
    where(fields, { eq }) {
      return eq(fields.nsId, id);
    },
  });
}

export type ReportNationalSectionsProType = Awaited<
  ReturnType<typeof getReportsNationalSections>
>;

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

export async function getOwnerByUserId(userId: SelectUser["id"]) {
  return db.query.owners.findFirst({
    where(fields, { eq }) {
      return eq(fields.userId, userId);
    },
  });
}

export async function getReportTypeCategoriesBySlugs(
  slugs: string[],
  locale: string = defaultLocale as SelectLanguages["code"]
) {
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

  return db.query.reportTypeCategories.findMany({
    where(fields, { inArray }) {
      return inArray(fields.slug, slugs);
    },
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
  });
}

export async function getAllReportTypeCategories(
  locale: string = defaultLocale as SelectLanguages["code"]
) {
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

  return db.query.reportTypeCategories.findMany({
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
  });
}

export type ReportTypeCategoriesType = Awaited<
  ReturnType<typeof getAllReportTypeCategories>
>;

export async function getAllRatingQuestionByType(
  name: SelectRatingType["name"],
  locale: string = defaultLocale as SelectLanguages["code"]
) {
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

  const sqRatingType = db
    .select({ id: ratingType.id })
    .from(ratingType)
    .where(eq(ratingType.name, name.toLowerCase()));

  return db.query.ratingQuestions.findMany({
    where(fields, operators) {
      return operators.eq(fields.ratingTypeId, sqRatingType);
    },
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
  });
}

export type RatingQuestionsType = Awaited<
  ReturnType<typeof getAllRatingQuestionByType>
>;

export async function getReportGroup(
  id: number,
  locale: string = defaultLocale as SelectLanguages["code"]
) {
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
  return db.query.reportGroup.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id);
    },
    with: {
      group: {
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
      ratingGroupToFestivals: {
        with: {
          festival: {
            with: {
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
          answers: true,
          reportGroupTypeLocales: {
            with: {
              reportTypeCategory: true,
            },
          },
          reportGroupTypeLocalesSleep: {
            with: {
              reportTypeCategory: true,
            },
          },
        },
      },
    },
  });
}

export type ReportGroupType = Awaited<ReturnType<typeof getReportGroup>>;

export async function getReportFestival(
  id: number,
  locale: string = defaultLocale as SelectLanguages["code"]
) {
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

  return db.query.reportFestival.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id);
    },
    with: {
      fesival: {
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
      activities: {
        with: {
          reportTypeCategory: {
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
      ratingFestivalToGroups: {
        with: {
          group: {
            with: {
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
          answers: true,
        },
      },
      nonGroups: true,
    },
  });
}

export type ReportFestivalType = Awaited<ReturnType<typeof getReportFestival>>;

export async function getReportNationalSection(
  id: number,
  locale: string = defaultLocale as SelectLanguages["code"]
) {
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

  return db.query.reportNationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id);
    },
    with: {
      activities: {
        with: {
          reportTypeCategory: {
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

export type ReportNationalSectionType = Awaited<
  ReturnType<typeof getReportNationalSection>
>;
