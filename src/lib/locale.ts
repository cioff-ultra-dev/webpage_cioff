"use server";

import { cookies } from "next/headers";
import { Locale } from "@/i18n/config";

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = "NEXT_LOCALE";
const COOKIE_TEMP_KEY = "NEXT_LOCALE_TEMP";

export async function getUserLocale() {
  const currentCookie = cookies();
  return currentCookie.get(COOKIE_NAME)?.value;
}

export async function setUserLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}

export async function setUserLocaleProfileTime(locale: Locale) {
  return cookies().set(COOKIE_TEMP_KEY, `${Date.now()}-${locale}`);
}
