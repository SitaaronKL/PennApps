
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { JWT } from "next-auth/jwt"
import { Session, Profile } from "next-auth"
import { Account } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

async function refreshAccessToken(token: JWT) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined, // Ensure error property is always present
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          response_type: "code",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined; // Convert to milliseconds
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        session.accessToken = token.accessToken;
        session.error = token.error as string | undefined; // Propagate error if any
        return session;
      }

      // Access token has expired, try to refresh it
      const refreshedToken = await refreshAccessToken(token);
      session.accessToken = refreshedToken.accessToken;
      session.error = refreshedToken.error; // Propagate error if any
      return session;
    },
    async redirect({ baseUrl }: { url: string; baseUrl: string }) {
      return baseUrl;
    },
    async signIn({ }: { account: Account | null; profile?: Profile }) {
      return true;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
