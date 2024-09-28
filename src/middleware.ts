import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { NextRequest, NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { defaultLocale, Locale, locales } from "./i18n/config";
import { getUserLocale, setUserLocale } from "./lib/locale";

function getLocale(request: Request) {
  const headers = Object.fromEntries(request.headers);
  let languages = new Negotiator({ headers }).languages();

  return match(languages, locales, defaultLocale);
}

const auth = NextAuth(authConfig).auth;

export default auth(async (req) => {
  const currentLocale = await getUserLocale();
  const locale = getLocale(req);
  if (!currentLocale) {
    const response = NextResponse.redirect(req.nextUrl);
    response.cookies.set("NEXT_LOCALE", locale);
    return response;
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$).*)"],
};
