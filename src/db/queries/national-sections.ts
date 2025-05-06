import { auth } from "@/auth";
import { db } from "@/db";
import {
  SelectLanguages,
  SelectNationalSection,
  SelectNationalSectionLang,
  languages,
  nationalSections,
  nationalSectionsLang,
  countries,
  countriesLang,
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
          photo: true,
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
      coverPhotos: {
        with: {
          photo: true,
        },
      },
      owners: true,
    },
  });
}

export type NationalSectionDetailsType = Awaited<
  ReturnType<typeof getNationalSectionBySlug>
>;

export async function getNationalSectionById(
  id: SelectNationalSection["id"],
  currentLocale: string = defaultLocale as SelectLanguages["code"]
) {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, currentLocale as SelectLanguages["code"]));

  return db.query.nationalSections.findFirst({
    where: eq(nationalSections.id, id),
    with: {
      positions: {
        with: {
          type: true,
          photo: true,
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

export type NationalSectionByIdType = Awaited<
  ReturnType<typeof getNationalSectionById>
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

export async function getNationaSectionById(
  id: SelectNationalSection["id"],
  locale: Locale
) {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(inArray(languages.code, [locale]))
    .limit(1);

  return db.query.nationalSections.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id);
    },
    with: {
      festivals: {
        with: {
          logo: true,
          owners: {
            with: {
              user: true,
            },
          },
          langs: {
            with: {
              l: true,
            },
          },
        },
      },
      groups: {
        with: {
          logo: true,
          owners: {
            with: {
              user: true,
            },
          },
          langs: {
            with: {
              l: true,
            },
          },
        },
      },
      positions: {
        with: {
          type: {
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
          photo: true,
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

export type NationalSectionTypeById = Awaited<
  ReturnType<typeof getNationaSectionById>
>;

export async function getAllNationalSectionsPage(locale: string) {
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

  return db.query.nationalSections.findMany({
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
      positions: true,
    },
  });
}

export type NationalSectionsPageType = Awaited<
  ReturnType<typeof getAllNationalSectionsPage>
>;

export type CountryCastNationalSections = {
  id: number;
  country: string | null;
  lat: string | null;
  lng: string | null;
  name: string | null;
  nationalSectionsCount: number;
  countryId: number | null;
}[];

export async function getAllCountryCastNationalSections(
  locale: Locale,
  regionsIn: string[] = [],
  search?: string,
  countriesIn: string[] = []
): Promise<CountryCastNationalSections> {
  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const query = db
    .select({
      id: nationalSections.id,
      countryId: countries.id,
      country: countries.slug,
      lat: countries.lat,
      lng: countries.lng,
      name: countriesLang.name,
      nationalSectionsCount: countDistinct(nationalSections.id),
    })
    .from(nationalSections)
    .leftJoin(countries, eq(countries.id, nationalSections.countryId))
    .leftJoin(countriesLang, eq(countries.id, countriesLang.countryId))
    .leftJoin(
      nationalSectionsLang,
      eq(nationalSections.id, nationalSectionsLang.nsId)
    )
    .$dynamic();

  filters.push(
    // isNotNull(festivals.countryId),
    eq(countriesLang.lang, sq)
  );

  if (regionsIn.length)
    filters.push(inArray(countries.regionId, regionsIn.map(Number)));

  if (search) filters.push(ilike(countriesLang.name, `%${search}%`));

  if (countriesIn.length)
    filters.push(inArray(nationalSections.countryId, countriesIn.map(Number)));

  query
    .where(and(...filters))
    .groupBy(nationalSections.id, countriesLang.id, countries.id)
    .orderBy(countries.slug);

  return query;
}
