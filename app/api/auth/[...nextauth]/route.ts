import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { verifyOtp } from '@/lib/verify-otp';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Mobile', type: 'text' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.otp) {
          return null;
        }

        try {
          return await verifyOtp(credentials.identifier, credentials.otp);
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.registrationNumber = (user as any).registrationNumber;
        token.badgeCategory = (user as any).badgeCategory;
        token.mobile = (user as any).mobile;
        token.certUrl = (user as any).certUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).registrationNumber = token.registrationNumber;
        (session.user as any).badgeCategory = token.badgeCategory;
        (session.user as any).mobile = token.mobile;
        (session.user as any).certUrl = token.certUrl;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
