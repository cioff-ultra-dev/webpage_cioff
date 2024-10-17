import { showHomePage } from "@/flags";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl, url } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isLoginPage = nextUrl.pathname === "/login";
      const homepage = await showHomePage();

      if (isLoggedIn && nextUrl.pathname === "/") {
        return Response.redirect(new URL("/dashboard", url));
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", url));
      }

      console.log({ homepage });

      if (!isLoggedIn && !isLoginPage && !homepage) {
        return Response.redirect(new URL("/login", url));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
