import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
      isActive?: boolean;
      lastLoginAt?: Date;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
    isActive?: boolean;
    lastLoginAt?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    provider?: string;
    isActive?: boolean;
    lastLoginAt?: Date;
  }
}
