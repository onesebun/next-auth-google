import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import { PrismaClient } from '@prisma/client'

let prisma

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
    })
    // ...add more providers here
  ],

  callbacks: {
    async signIn(user, account, profile) {
      if (account.provider === 'google' &&
          profile.verified_email === true &&
          profile.email.endsWith('@gmail.com')) {
        return true
      } else {
        return false
      }
    },
  },


  // A database is optional, but required to persist accounts in a database
  // database: process.env.DATABASE_URL,
  adapter: Adapters.Prisma.Adapter({
    prisma,
    modelMapping: {
      User: 'user',
      Account: 'account',
      Session: 'session',
      VerificationRequest: 'verificationRequest'
    }
  }),
})