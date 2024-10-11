import {
  events,
  InsertEvent,
  SelectEvent,
  festivals,
  InsertFestival,
  SelectFestival,
  festivalToCategories,
  categories,
  SelectLanguages,
  languages,
} from "@/db/schema";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { defaultLocale } from "@/i18n/config";

export async function getAllEvents(): Promise<Array<SelectEvent>> {
  return db.query.events.findMany({
    limit: 10,
  });
}

export async function newEvent(event: InsertEvent) {
  return db.insert(events).values(event).returning();
}

export async function getAllFestivals(): Promise<Array<SelectFestival>> {
  return db.select().from(festivals).limit(10);
}

export async function newFestival(festival: InsertFestival) {
  return db.insert(festivals).values(festival).returning();
}

export async function getFestivalById(
  id: SelectFestival["id"],
  locale: string
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

  return db.query.festivals.findFirst({
    where(fields, { eq }) {
      return eq(fields.id, id);
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

export async function getFestivalBySlug(
  slug: SelectFestival["slug"],
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

  return db.query.festivals.findFirst({
    where(fields, { eq }) {
      return eq(fields.slug, slug!);
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
      events: true,
      festivalsToCategories: {
        with: {
          category: {
            with: {
              langs: true,
            },
          },
        },
      },
      social: true,
      status: true,
      owners: {
        with: {
          user: {
            with: {
              role: true,
            },
          },
        },
      },
    },
  });
}

export type FestivalBySlugType = Awaited<ReturnType<typeof getFestivalBySlug>>;

export async function getAllNestedFestivals() {
  const baseQuery = db
    .select({
      festivals: festivals,
    })
    .from(festivalToCategories)
    .innerJoin(festivals, eq(festivalToCategories.festivalId, festivals.id))
    .leftJoin(categories, eq(festivalToCategories.categoryId, categories.id))
    .groupBy(festivals.id)
    .limit(10);

  return await baseQuery;
}

export async function getAllFestivalsByOwner(locale: string) {
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
          festivals: {
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
      festival: {
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

export type FestivalByOwnerType = Awaited<
  ReturnType<typeof getAllFestivalsByOwner>
>;

export async function getCategoryForGroups(locale: string, fields: string[]) {
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

  return db.query.categories.findMany({
    where: inArray(categories.slug, fields),
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
