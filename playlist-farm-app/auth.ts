import NextAuth, { NextAuthOptions } from "next-auth"
import SpotifyProvider from "next-auth/providers/spotify"
import { prisma } from "@/lib/prisma"

// Spotify scopes for accessing user data
const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read",
  "user-top-read",
].join(" ")

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
  },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        })

        if (!existingUser) {
          // Create new user with linked account
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || (profile as any)?.display_name || "Spotify User",
              image: user.image,
              accounts: {
                create: {
                  type: account!.type,
                  provider: account!.provider,
                  providerAccountId: account!.providerAccountId,
                  access_token: account!.access_token,
                  token_type: account!.token_type,
                  scope: account!.scope,
                  refresh_token: account!.refresh_token,
                  expires_at: account!.expires_at,
                },
              },
            },
          })
        } else if (!existingUser.accounts.some(acc => acc.provider === account!.provider)) {
          // User exists but account not linked - link it
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account!.type,
              provider: account!.provider,
              providerAccountId: account!.providerAccountId,
              access_token: account!.access_token,
              token_type: account!.token_type,
              scope: account!.scope,
              refresh_token: account!.refresh_token,
              expires_at: account!.expires_at,
            },
          })
        }

        return true
      } catch (error) {
        console.error("SignIn error:", error)
        return false
      }
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      // Store Spotify access token in session
      if (token.accessToken) {
        session.user.accessToken = token.accessToken as string
      }

      return session
    },
    async jwt({ token, account, user }) {
      // Initial sign in - set user ID in token
      if (account && user) {
        // Find the user we just created/updated in the database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (dbUser) {
          token.sub = dbUser.id
        }

        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.accessTokenExpires = account.expires_at

        return token
      }

      // Token already has the user ID, no need to refresh anything else
      return token
    },
  },
}

export default NextAuth(authOptions)
