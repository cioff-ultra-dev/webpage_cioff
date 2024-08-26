import { NextResponse } from "next/server";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, url } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isLoggedIn && nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard/events", url));
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }
      return NextResponse.next();
    },
  },
  providers: [],
} satisfies NextAuthConfig;
