import {
  events,
  InsertEvent,
  SelectEvent,
  festivals,
  InsertFestival,
  SelectFestival,
  festivalsToCategoriesTable,
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

export async function getAllNestedFestivals() {
  const baseQuery = db
    .select({
      festivals: festivals,
    })
    .from(festivalsToCategoriesTable)
    .innerJoin(
      festivals,
      eq(festivalsToCategoriesTable.festivalId, festivals.id)
    )
    .leftJoin(
      categories,
      eq(festivalsToCategoriesTable.categoryId, categories.id)
    )
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

  return db.query.festivals.findMany({
    with: {
      owners: {
        where(fields, { eq }) {
          return eq(fields.userId, session?.user.id!);
        },
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
            },
          },
        },
      },
    },
  });
}
