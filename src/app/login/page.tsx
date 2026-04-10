// app/login/page.tsx
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Login ဝင်ပြီးသားဆိုရင် သူ့ Role နဲ့သူ သက်ဆိုင်ရာ Dashboard တွေကို ကန်ပို့မယ်
  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "SUPER_ADMIN") redirect("/super-admin/dashboard");
    if (role === "STATION_ADMIN") redirect("/station-admin/dashboard");
    // ==========================================
    // Customer များအတွက် Vehicle Info စစ်ဆေးခြင်း
    // ==========================================
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    // ယာဉ်နံပါတ် (သို့) ဆီအမျိုးအစား မဖြည့်ရသေးရင် add-vehicle ကို အတင်းပို့မယ်
    if (!currentUser?.plateNumber || !currentUser?.fuelType) {
      redirect("/customers/add-vehicle");
    } else {
      // အားလုံးပြည့်စုံမှ ဆီဆိုင်များ စာမျက်နှာကို ပို့မယ်
      redirect("/customers/stations");
    }
  }

  return (
    <main>
      <LoginForm />
    </main>
  );
}
