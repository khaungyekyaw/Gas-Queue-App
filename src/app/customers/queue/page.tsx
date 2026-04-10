// app/(customer)/queue/page.tsx
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import QueueDisplay from "./QueueDisplay";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ stationId?: string }>;
}) {
  // ၁။ Login ဝင်ထားခြင်း ရှိမရှိ စစ်ဆေးမယ်
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // ၂။ User ရဲ့ ID ကို လှမ်းယူမယ်
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  // ၃။ ဒီနေ့အတွက် ယူထားတဲ့ PENDING Queue ရှိ/မရှိ စစ်ဆေးမယ် (Refresh လုပ်ရင် QR ပျောက်မသွားအောင်)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentQueue = await prisma.queue.findFirst({
    where: {
      customerId: user.id,
      status: "PENDING",
      createdAt: { gte: today },
    },
    include: {
      station: {
        select: { name: true, location: true }, // UI မှာ ဆိုင်နာမည်ပြဖို့
      },
    },
  });

  // ==========================================
  // ရှေ့တွင်ကျန်သော လူအရေအတွက် (peopleAhead) အား တွက်ချက်ခြင်း (အသစ်ထည့်သွင်းသည်)
  // ==========================================
  let peopleAhead = 0;
  if (currentQueue) {
    peopleAhead = await prisma.queue.count({
      where: {
        stationId: currentQueue.stationId,
        status: "PENDING", // PENDING ဖြစ်နေဆဲ သူတွေကိုသာ ရေတွက်မည်
        createdAt: {
          gte: today, // ယနေ့ ယူထားသော
          lt: currentQueue.createdAt, // လက်ရှိ Customer ထက် အချိန်စော၍ ယူထားသူများ
        },
      },
    });
  }

  // ၄။ URL ကနေ stationId ကို ဖမ်းယူမယ်
  const resolveParams = await searchParams;
  const stationId = resolveParams.stationId;

  // currentQueue ထဲသို့ peopleAhead ကိုပါ ပေါင်းထည့်၍ Client Component သို့ ပို့ပေးမည်
  const queueDataWithPeopleAhead = currentQueue
    ? { ...currentQueue, peopleAhead }
    : null;

  return (
    <main>
      {/* ၅။ Data တွေကို Client Component ဆီ လှမ်းပို့ပေးမယ် */}
      <QueueDisplay
        stationId={stationId}
        currentQueue={queueDataWithPeopleAhead}
      />
    </main>
  );
}
