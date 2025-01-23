import { and, eq, ilike, inArray, SQLWrapper } from "drizzle-orm";
import { NextRequest } from "next/server";

import {
  countries,
  countriesLang,
  languages,
  SelectCountries,
  SelectCountryLang,
  users,
  roles,
  SelectRoles,
} from "@/db/schema";
import { db } from "@/db";
import { defaultLocale, Locale } from "@/i18n/config";

const PAGE_SIZE = 100;

export type BuildUserFilterType = Awaited<ReturnType<typeof buildFilter>>;

async function buildFilter(request: NextRequest) {
  const countriesIn: string[] = JSON.parse(
    request.nextUrl.searchParams.get("countries") || "[]"
  );
  const role: string = request.nextUrl.searchParams.get("role") || "";
  const search: string = request.nextUrl.searchParams.get("search") || "";
  const page: number = Number(request.nextUrl.searchParams.get("page") || "1");
  const countryId: number = Number(
    request.nextUrl.searchParams.get("countryId") || "0"
  );

  const locale: Locale =
    (request.nextUrl.searchParams.get("locale") as Locale) || defaultLocale;

  const sq = db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, locale));

  const filters: SQLWrapper[] = [];

  const baseQuery = db
    .select({
      country: countries,
      countryLang: countriesLang,
      roles: roles,
      id: users.id,
      email: users.email,
      firstName: users.firstname,
      lastName: users.lastname,
    })
    .from(users)
    .leftJoin(countries, eq(users.countryId, countries.id))
    .leftJoin(countriesLang, eq(countriesLang.countryId, countries.id))
    .leftJoin(roles, eq(roles.id, users.roleId))
    .$dynamic();

  filters.push(eq(countriesLang.lang, sq));

  if (role)
    filters.push(
      eq(
        users.roleId,
        db
          .select({ id: roles.id })
          .from(roles)
          .where(ilike(roles.name, `%${role}%`))
      )
    );

  if (countriesIn.length && !countryId)
    filters.push(inArray(users.countryId, countriesIn.map(Number)));

  if (countryId) filters.push(eq(users.countryId, countryId));

  if (search) filters.push(ilike(users.firstname, `%${search}%`));

  baseQuery
    .where(and(...filters))
    .groupBy(countries.id, countriesLang.id, roles.id, users.id)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const result = (await baseQuery).reduce<
    Record<
      string,
      {
        country: SelectCountries;
        countryLang: SelectCountryLang;
        role: SelectRoles;
        id: string;
        email: string;
        firstName: string;
        lastName: string | null;
      }
    >
  >((acc, row) => {
    const country = row.country;
    const roles = row.roles;
    const countryLang = row.countryLang;

    if (!acc[row.id]) {
      acc[row.id] = {
        role: roles!,
        country: country!,
        countryLang: countryLang!,
        email: row.email,
        id: row.id,
        firstName: row.firstName!,
        lastName: row.lastName,
      };
    }

    return acc;
  }, {});

  return Object.values(result);
}

export async function GET(request: NextRequest) {
  const result = await buildFilter(request);
  console.log(result.length);
  return Response.json(result);
}
