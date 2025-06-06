import { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "./db";
import User from "@/models/User";

interface GoogleProfile extends Profile {
  email_verified?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const googleProfile = profile as GoogleProfile;

        try {
          await connectToDatabase();

          if (!googleProfile?.email_verified || !googleProfile.email) {
            console.log("Email not verified or does not exist.");
            return false;
          }

          const existingUser = await User.findOrCreateOAuthUser(
            googleProfile,
            "google",
          );

          if (!existingUser.isActive) {
            console.log("User account is inactive");
            return false;
          }

          console.log("User signed in successfully:", existingUser.email);
          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        try {
          await connectToDatabase();
          const dbUser = await User.findOne({ email: profile.email });

          if (dbUser) {
            token.userId = dbUser._id.toString();
            token.provider = dbUser.provider;
            token.isActive = dbUser.isActive;
            token.lastLoginAt = dbUser.lastLoginAt;
          }
        } catch (error) {
          console.error("Error in JWT callback:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.provider = token.provider as string;
        session.user.isActive = token.isActive as boolean;
        session.user.lastLoginAt = token.lastLoginAt as Date;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signIn({ user }) {
      if (user.email) {
        try {
          await connectToDatabase();
          await User.findOneAndUpdate(
            { email: user.email },
            { lastLoginAt: new Date() },
            { new: true },
          );
          console.log("Login event recorded for:", user.email);
        } catch (error) {
          console.error("Error recording login event:", error);
        }
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
