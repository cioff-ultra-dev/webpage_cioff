import { auth } from "@/auth";
import { db } from "@/db";
import {
  groups,
  InsertTypeGroup,
  languages,
  SelectGroup,
  SelectLanguages,
  typeGroups,
} from "@/db/schema";
import { defaultLocale } from "@/i18n/config";
import { eq, inArray } from "drizzle-orm";

const _queryAllPrepared = db
  .select()
  .from(typeGroups)
  .prepare("statement_all_type_groups");

export async function getAllTypeGroups() {
  return _queryAllPrepared.execute();
}

export async function createTypeGroup(type: InsertTypeGroup) {
  return db.insert(typeGroups).values(type).returning();
}

export async function getAllGroups() {
  return db.query.groups.findMany({
    with: {
      country: true,
    },
  });
}

export type AllGroupType = Awaited<ReturnType<typeof getAllGroups>>;

export async function getGroupById(id: SelectGroup["id"]) {
  return db.query.groups.findFirst({
    where: eq(groups.id, id),
    with: {
      directorPhoto: true,
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

  return db.query.groups.findMany({
    with: {
      country: true,
      owners: {
        where(fields, { eq }) {
          return eq(fields.userId, session?.user.id!);
        },
        with: {
          group: {
            with: {
              country: true,
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
