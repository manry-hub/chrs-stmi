import type { NextAuthConfig } from "next-auth";
import { ROUTES } from "@/constants";

export const authConfig = {
  pages: {
    signIn: ROUTES.LOGIN,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isAuthRoute = nextUrl.pathname.startsWith(ROUTES.LOGIN) || nextUrl.pathname.startsWith(ROUTES.REGISTER);
      
      if (isApiAuthRoute) return true;

      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL(ROUTES.DASHBOARD, nextUrl));
        }
        return true;
      }

      // Allow all other routes initially, we'll guard specific roles in Layout components
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },
  },
  providers: [], // Add providers in auth.ts so we can use Node-only APIs
} satisfies NextAuthConfig;
