import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, url } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isLoginPage = nextUrl.pathname === "/login";

      // if (isLoggedIn && nextUrl.pathname === "/dashboard") {
      //   return Response.redirect(new URL("/dashboard/festivals", url));
      // }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", url));
      }

      if (!isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/login", url));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
