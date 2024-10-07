import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { defaultLocale, locales } from "./i18n/config";
import { getUserLocale } from "./lib/locale";

function getLocale(request: Request) {
  const headers = Object.fromEntries(request.headers);
  let languages = new Negotiator({ headers }).languages();

  return match(languages, locales, defaultLocale);
}

const auth = NextAuth(authConfig).auth;

export default auth(async (req) => {
  const currentLocale = await getUserLocale();
  const locale = getLocale(req);

  const headers = new Headers(req.headers);
  headers.set("x-current-path", req.nextUrl.pathname);

  if (!currentLocale) {
    const response = NextResponse.redirect(req.nextUrl);
    response.cookies.set("NEXT_LOCALE", locale);
    response.headers.set("x-current-path", req.nextUrl.pathname);
    return response;
  }
  return NextResponse.next({ headers });
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$).*)"],
};
