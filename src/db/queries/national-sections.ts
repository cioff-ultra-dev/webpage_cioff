import { auth } from "@/auth";
import { db } from "@/db";
import {
  SelectLanguages,
  SelectNationalSection,
  SelectNationalSectionLang,
  languages,
  nationalSections,
  nationalSectionsLang,
} from "@/db/schema";
import { defaultLocale } from "@/i18n/config";
import { and, eq, inArray, sql } from "drizzle-orm";

export type LangWithNationalSection = SelectNationalSection & {
  langs: SelectNationalSectionLang[];
};

export async function getAllNationalSections(): Promise<
  LangWithNationalSection[]
> {
  const session = await auth();
  return db.query.nationalSections.findMany({
    where: and(eq(nationalSections.countryId, session?.user.countryId!)),
    with: {
      langs: {
        where: eq(nationalSectionsLang.lang, 1),
      },
    },
  });
}

export async function getNationalSectionBySlug(
  slug: SelectNationalSection["slug"],
  currentLocale: string = defaultLocale as SelectLanguages["code"]
) {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, currentLocale as SelectLanguages["code"]));

  return db.query.nationalSections.findFirst({
    where: eq(nationalSections.slug, slug),
    with: {
      positions: {
        with: {
          type: true,
          langs: {
            where(fields, { eq }) {
              return eq(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      festivals: {
        with: {
          owners: {
            with: {
              user: {
                columns: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          langs: {
            where(fields, { eq }) {
              return eq(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      groups: {
        with: {
          owners: {
            with: {
              user: {
                columns: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          langs: {
            where(fields, { eq }) {
              return eq(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      social: true,
      otherEvents: {
        with: {
          langs: {
            where(fields, { eq }) {
              return eq(fields.lang, sq);
            },
            with: {
              l: true,
            },
          },
        },
      },
      langs: {
        where(fields, { eq }) {
          return eq(fields.lang, sq);
        },
        with: {
          l: true,
        },
      },
    },
  });
}

export type NationalSectionDetailsType = Awaited<
  ReturnType<typeof getNationalSectionBySlug>
>;

export async function getCurrentNationalSection(
  countryId: SelectNationalSection["countryId"]
) {
  return db.query.nationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.countryId, countryId!);
    },
  });
}

export type CurrentNationalSectionType = Awaited<
  ReturnType<typeof getCurrentNationalSection>
>;

export async function getAllNationalSectionsByOwner(locale: string) {
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

  // return db.query.nationalSections.findMany({
  //   with: {
  //     owners: {
  //       where(fields, { eq }) {
  //         return eq(fields.userId, session?.user.id!);
  //       },
  //       with: {
  //         ns: {
  //           with: {
  //             langs: {
  //               where(fields, { inArray }) {
  //                 return inArray(fields.lang, sq);
  //               },
  //               with: {
  //                 l: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
}

export type NationalSectionByOwnerType = Awaited<
  ReturnType<typeof getAllNationalSectionsByOwner>
>;

export async function getAllTypePositionsforNS(locale: string) {
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

  return db.query.typePosition.findMany({
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

export type PositionTypeForNSType = Awaited<
  ReturnType<typeof getAllTypePositionsforNS>
>;
