import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole | string;
      phone?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: UserRole | string;
    phone?: string;
  }
}
