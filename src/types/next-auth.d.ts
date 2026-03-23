import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "moderator" | "author" | "seller" | "member";
      userId: string;
      discordUsername: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "moderator" | "author" | "seller" | "member";
    discordUsername: string;
  }
}
