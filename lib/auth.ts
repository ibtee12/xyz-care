import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserRole } from "@/lib/generated/prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const passwordIsValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordIsValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          roll_number: user.roll_number,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole;
        token.roll_number = user.roll_number;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as UserRole;
        session.user.roll_number = (token.roll_number as string | null) ?? null;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
