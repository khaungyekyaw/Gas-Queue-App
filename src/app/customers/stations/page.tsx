// app/(customer)/stations/page.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma"; // libs ဖြစ်နေရင် ပြင်ပါ
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StationList from "./StationList";

export default async function StationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.plateNumber || !user?.fuelType) {
    redirect("/customers/add-vehicle");
  }

  // ဒီနေ့အတွက် နေ့စွဲ (Queue တွေ Count ဖို့)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ၁။ ဆီဆိုင်စာရင်း ဆွဲထုတ်ခြင်း
  const stations = await prisma.station.findMany({
    where: { isArchived: false },
    include: {
      _count: {
        select: { queues: { where: { createdAt: { gte: today } } } },
      },
    },
  });

  // ==========================================
  // ၂။ Customer ၏ လက်ရှိ Queue အား ရှာဖွေခြင်း (အသစ်ထည့်ထားသောအပိုင်း)
  // ==========================================
  const currentQueue = await prisma.queue.findFirst({
    where: {
      customerId: user.id,
      status: "PENDING",
      createdAt: { gte: today },
    },
    include: {
      station: { select: { name: true } }, // ဆိုင်နာမည်လေး ပြချင်လို့ပါ
    },
  });

  return (
    <main>
      {/* currentQueue ကိုပါ Props အနေနဲ့ ထည့်ပို့ပေးလိုက်ပါသည် */}
      <StationList stations={stations} currentQueue={currentQueue} />
    </main>
  );
}
