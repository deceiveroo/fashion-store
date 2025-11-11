import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Проверяем жестко заданного администратора
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin') {
          return {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin',
            role: 'admin',
          };
        }

        // Ищем пользователя в базе данных
        try {
          const userResults = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          const user = userResults[0];

          if (user && user.password) {
            // Проверяем пароль
            const isValidPassword = await bcrypt.compare(
              credentials.password as string, 
              user.password
            );

            if (isValidPassword) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role || 'user',
              };
            }
          }
        } catch (error) {
          console.error('Auth error:', error);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
} satisfies NextAuthConfig;