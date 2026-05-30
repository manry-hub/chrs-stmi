import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "user" | "admin" | "superadmin";
  }
  interface Session {
    user: { role: "user" | "admin" | "superadmin" } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "user" | "admin" | "superadmin";
  }
}
