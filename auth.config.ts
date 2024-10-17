import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isLoginPage = nextUrl.pathname === "/login";

      // if (isLoggedIn && nextUrl.pathname === "/") {
      //   return Response.redirect(new URL("/dashboard", nextUrl));
      // }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
