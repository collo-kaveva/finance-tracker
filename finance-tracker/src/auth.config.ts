import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.currency = (user as { currency?: string }).currency ?? "USD";
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.currency) token.currency = session.currency;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.currency = (token.currency as string) ?? "USD";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
