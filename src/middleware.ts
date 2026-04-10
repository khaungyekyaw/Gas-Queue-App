// middleware.ts (သို့) src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Ep 33: NextAuth ရဲ့ withAuth ကို သုံးပြီး လုံခြုံရေး စစ်ဆေးခြင်း
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token; // Login ဝင်ထားတဲ့ User ရဲ့ အချက်အလက် (Role ပါမယ်)
    const path = req.nextUrl.pathname; // User သွားချင်နေတဲ့ URL

    // ၁။ Super Admin လမ်းကြောင်းများကို ကာကွယ်ခြင်း
    if (path.startsWith("/super-admin") && token?.role !== "SUPER_ADMIN") {
      // Super Admin မဟုတ်ဘဲ ဝင်လာရင် Login (သို့) Home ကို ပြန်ကန်ချမယ်
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ၂။ Station Admin လမ်းကြောင်းများကို ကာကွယ်ခြင်း
    if (path.startsWith("/station-admin") && token?.role !== "STATION_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ၃။ Customer များကို Admin Page များသို့ မဝင်စေရန် (Optional - အပေါ်က Rules တွေနဲ့တင် လုံလောက်ပါတယ်)
  },
  {
    callbacks: {
      // authorized က true ပြန်ပေးမှ အပေါ်က middleware function ဆီကို ရောက်ပါမယ်
      // Token ရှိနေမှ (Login ဝင်ထားမှ) ဆက်ခွင့်ပြုမယ်လို့ ဆိုလိုတာပါ
      authorized: ({ token }) => !!token,
    },
  },
);

// Ep 23: config သတ်မှတ်ခြင်း
// ဘယ် Route တွေမှာ ဒီ Middleware ကင်းစောင့်ရမလဲ ဆိုတာကို သတ်မှတ်တာပါ
export const config = {
  matcher: [
    "/super-admin/:path*",
    "/station-admin/:path*",
    "/customers/stations/:path*",
    "/customers/queue/:path*",
    "/customers/add-vehicle/:path*",
  ],
};
