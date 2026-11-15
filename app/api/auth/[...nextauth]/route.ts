import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

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
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: credentials.identifier,
              otp: credentials.otp
            })
          });

          const data = await response.json();

          if (response.ok && data.success) {
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              registrationNumber: data.user.registrationNumber,
              badgeCategory: data.user.badgeCategory,
              mobile: data.user.mobile,
              certUrl: data.user.certUrl
            };
          }

          return null;
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
