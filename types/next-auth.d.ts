import { DefaultSession } from "next-auth";

export type UserRole = "FREE" | "PAID" | "ADMIN";
export type UserSchoolSlug = "dsse" | "ahss" | null;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      schoolSlug: UserSchoolSlug;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    schoolSlug?: UserSchoolSlug;
  }
}
