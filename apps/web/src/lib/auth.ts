import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { workspaceUsers, workspaces } from "@magiclinkkit/db";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@magiclinkkit/db";

const nextAuth = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const [user] = await db
          .select()
          .from(workspaceUsers)
          .where(eq(workspaceUsers.email, email))
          .limit(1);

        if (!user) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        const [workspace] = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, user.workspaceId))
          .limit(1);

        return {
          id: user.id,
          email: user.email,
          name: workspace?.name ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth } = nextAuth;
