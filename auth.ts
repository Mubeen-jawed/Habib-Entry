import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Hardcoded admin login. Backed by a real User row (upserted on first
// sign-in) so admin-owned rows like Attempt / Essay can foreign-key to it.
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "hahaha";
const ADMIN_EMAIL = "admin@local";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "admin",
    name: "Admin",
    credentials: {
      username: { label: "Username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const username = (credentials?.username as string | undefined)?.trim();
      const password = credentials?.password as string | undefined;
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) return null;

      const user = await db.user.upsert({
        where: { email: ADMIN_EMAIL },
        update: { role: "ADMIN" },
        create: { email: ADMIN_EMAIL, name: "admin", role: "ADMIN" },
      });

      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
  Credentials({
    id: "credentials",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = (credentials?.email as string | undefined)?.toLowerCase().trim();
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const user = await db.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return null;

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;

      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await db.user.update({
          where: { id: user.id },
          data: { lastSignInAt: new Date() },
        }).catch(() => {});
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) token.id = user.id;

      // Refresh role + school from DB on sign-in and periodically (session update).
      if (token.id && (user || trigger === "update" || !token.role)) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, schoolSlug: true },
        });
        token.role = (dbUser?.role as "FREE" | "PAID" | "ADMIN") ?? "FREE";
        token.schoolSlug = (dbUser?.schoolSlug as "dsse" | "ahss" | null) ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "FREE" | "PAID" | "ADMIN") ?? "FREE";
        session.user.schoolSlug = (token.schoolSlug as "dsse" | "ahss" | null) ?? null;
      }
      return session;
    },
  },
});
