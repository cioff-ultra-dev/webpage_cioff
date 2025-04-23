"use server";

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
  components,
  festivalsLang,
  SelectFestivalLang,
} from "@/db/schema";
import { db } from "@/db";
import { eq, gte, inArray, and } from "drizzle-orm";
import { auth } from "@/auth";
import { defaultLocale, Locale } from "@/i18n/config";

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
      owners: {
        with: {
          user: true,
        },
      },
      logo: true,
      coverPhoto: true,
      photos: {
        with: {
          photo: true,
        },
      },
      events: true,
      social: true,
      festivalsToCategories: {
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
      festivalsToGroups: {
        with: {
          group: {
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
      reportsFromGroups: {
        with: {
          answers: true,
          report: {
            with: {
              group: {
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
      langs: {
        where(fields, { inArray }) {
          return inArray(fields.lang, sq);
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
      accomodationPhoto: true,
      transports: true,
      stagePhotos: {
        with: {
          photo: true,
        },
      },
    },
  });
}

export type FestivalByIdType = Awaited<ReturnType<typeof getFestivalById>>;

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
      coverPhoto: true,
      logo: true,
      accomodationPhoto: true,
      certification: true,
      photos: {
        with: {
          photo: true,
        },
      },
      stagePhotos: {
        with: {
          photo: true,
        },
      },
      festivalsToStatuses: true,
      festivalsToComponents: true,
      festivalsToGroups: {
        with: {
          group: {
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
      festivalsGroupToRegions: true,
      transports: true,
      social: true,
      status: true,
      connections: {
        with: {
          target: {
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
      owners: {
        with: {
          user: {
            with: {
              role: true,
            },
          },
        },
      },
      coverPhotos: {
        with: {
          photo: true,
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

export type NestedFestivalsType = Awaited<
  ReturnType<typeof getAllNestedFestivals>
>;

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

export async function getComponentForGroups(locale: string, fields: string[]) {
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

  return db.query.components.findMany({
    where: inArray(components.slug, fields),
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

export type ComponentsForGroupType = Awaited<
  ReturnType<typeof getComponentForGroups>
>;

export async function buildFestival(countryId: number) {
  return await db.query.festivals.findMany({
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

interface EventsParams {
  fromDate: Date;
  limit: number;
  locale:Locale;
}

export interface EventsByDate {
  festival: SelectFestival;
  event: SelectEvent;
  info: SelectFestivalLang;
}

export async function getEventsByDate({
  fromDate,
  limit,
  locale
}: EventsParams): Promise<EventsByDate[]> {
   const sq = db
      .select({ id: languages.id })
      .from(languages)
      .where(eq(languages.code, locale));

  const response = await db
    .selectDistinctOn([festivals.id], {
      festival: festivals,
      event: events,
      info: festivalsLang,
    })
    .from(festivals)
    .innerJoin(events, eq(events.festivalId, festivals.id))
    .innerJoin(
      festivalsLang,
      and(
        eq(festivalsLang.festivalId, festivals.id),
        eq(festivalsLang.lang, sq)
      )
    )
    .where(gte(events.startDate, fromDate))
    .limit(limit);

  return response;
}
