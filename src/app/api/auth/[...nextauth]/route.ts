// app/api/auth/[...nextauth]/route.ts
import { prisma } from "@/libs/prisma";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    // ၁။ Customer များအတွက် Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // ၂။ Admin များအတွက် Phone/Email + Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phoneNo: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNo || !credentials?.password) return null;

        // ဖုန်းနံပါတ်နဲ့ Database ထဲမှာ Admin ကို ရှာမယ်
        const user = await prisma.user.findUnique({
          where: { phoneNo: credentials.phoneNo },
        });

        // User မရှိရင် (သို့) စကားဝှက်မှားနေရင် (တကယ့် Production မှာ bcrypt သုံးပြီး စစ်သင့်ပါတယ်)
        if (!user || user.password !== credentials.password) {
          throw new Error("ဖုန်းနံပါတ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။");
        }

        // အကောင့်ကို ပိတ်ထားရင် (isArchived: true) ဝင်ခွင့်မပြုပါ
        if (user.isArchived) {
          throw new Error("ဤအကောင့်မှာ ပိတ်သိမ်းခံထားရပါသည်။");
        }

        return {
          id: user.id,
          name: user.name,
          role: user.role, // အရေးကြီးဆုံး: Admin Role ကို ပြန်ပို့ပေးမယ်
        };
      },
    }),
  ],

  // ၃။ Callbacks (Session ထဲကို Data တွေ ထည့်ပေးမယ့်နေရာ)
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        // Google နဲ့ ဝင်လာရင် Database ထဲမှာ ဒီ Email ရှိမရှိ စစ်မယ်
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });

        // မရှိသေးရင် အကောင့်သစ် (CUSTOMER) အနေနဲ့ Auto ဖွင့်ပေးမယ်
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email as string,
              name: user.name as string,
              image: user.image as string,
              role: "CUSTOMER",
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // ဝင်ခါစမှာ user data ပါလာရင် token ထဲကို role နဲ့ id ထည့်မှတ်ထားမယ်
      if (user) {
        const dbUser = await prisma.user.findFirst({
          where: { OR: [{ email: user.email }, { id: user.id }] },
        });
        token.role = dbUser?.role || "CUSTOMER";
        token.id = dbUser?.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Client ဘက်ကနေ session ခေါ်သုံးရင် role နဲ့ id ကို မြင်ရအောင် ထည့်ပေးလိုက်တယ်
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Default UI အစား ငါတို့ရေးမယ့် /login page ကို သုံးမယ်လို့ ကြေညာတာပါ
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
