import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      emailVerifiedAt?: Date | null;
      tokenVersion?: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin: boolean;
    emailVerifiedAt?: Date | null;
    tokenVersion?: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    emailVerifiedAt?: Date | null;
    tokenVersion?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdmin: boolean;
    emailVerifiedAt?: Date | null;
    tokenVersion?: number;
  }
}
