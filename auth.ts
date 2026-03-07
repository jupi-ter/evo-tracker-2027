import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

type DBUser = {
  id: number;
  name: string;
  email: string;
  hash: string;
  nationality?: string | null; // ✅ pode ser null ou undefined
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email?: string;
      nationality?: string;
      // ✅ nacionalidade agora existe
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .then((r) => r[0] as DBUser);

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hash,
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          nationality: user.nationality ?? undefined,
        }; // <-- retorna a nacionalidade do DB
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;

      if (token.nationality)
        session.user.nationality = token.nationality as string;

      return session;
    },
    async jwt({ token, user }) {
      if (user && "nationality" in user && user.nationality) {
        token.nationality = user.nationality;
      }
      return token;
    },
  },
});
