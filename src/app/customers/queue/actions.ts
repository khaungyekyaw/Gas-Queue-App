// app/(customer)/queue/actions.ts
"use server";

import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache"; // Ep 43: Data အသစ်ဖြစ်အောင် refresh လုပ်ဖို့
import QRCode from "qrcode"; // Ep 37: QR Code Library

export async function takeQueueAction(stationId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) return { error: "Login ဝင်ရန် လိုအပ်ပါသည်" };

  try {
    // ၁။ User ရဲ့ Vehicle Info စစ်ဆေးခြင်း
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.plateNumber || !user?.fuelType) {
      return {
        error: "ယာဉ်အချက်အလက် ဦးစွာ ဖြည့်သွင်းပါ။",
        redirect: "/add-vehicle",
      };
    }

    // ဒီနေ့ ည ၁၂ နာရီကနေ စရေတွက်မယ်
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ၂။ လက်ရှိ PENDING ဖြစ်နေတဲ့ Queue ရှိမရှိ စစ်ဆေးခြင်း (Rule: တစ်ကြိမ်တည်း ၂ ခု ယူခွင့်မပြု)
    const existingQueue = await prisma.queue.findFirst({
      where: {
        customerId: user.id,
        status: "PENDING",
        createdAt: { gte: today },
      },
    });

    if (existingQueue) {
      return { error: "လူကြီးမင်းတွင် ယနေ့အတွက် တန်းစီနံပါတ် ရှိနေပါပြီ။" };
    }

    // ၃။ Station ရဲ့ Limit ပြည့်မပြည့် စစ်ဆေးခြင်း
    const station = await prisma.station.findUnique({
      where: { id: stationId },
      include: {
        _count: {
          select: { queues: { where: { createdAt: { gte: today } } } },
        },
      },
    });

    if (!station || !station.isOpen) return { error: "ဆီဆိုင် ပိတ်ထားပါသည်။" };
    if (station._count.queues >= station.dailyQueueLimit) {
      return { error: "ဤဆီဆိုင်တွင် ယနေ့အတွက် Queue ပြည့်သွားပါပြီ။" };
    }

    // ၄။ Queue အသစ်နှင့် QR Code ထုတ်လုပ်ခြင်း (Ep 25 & 37)
    const queueNumber = station._count.queues + 1; // ဥပမာ - ၁၀၀ ရှိရင် ၁၀၁ ယူမယ်

    // (က) Queue ကို အရင်တည်ဆောက်လိုက်ပါ (id ထွက်လာအောင်လို့ပါ)
    const newQueue = await prisma.queue.create({
      data: {
        queueNumber,
        qrCodeString: "temp", // ယာယီ ထည့်ထားမယ်
        requestedFuelType: user.fuelType,
        customerId: user.id,
        stationId: station.id,
      },
    });

    // (ခ) ထွက်လာတဲ့ Queue ID အစစ်ကို သုံးပြီး QR Code ပုံထုတ်ပါမယ်
    const qrCodeString = await QRCode.toDataURL(newQueue.id, {
      color: { dark: "#000000", light: "#FFFFFF" },
      margin: 2,
    });

    // (ဂ) ထွက်လာတဲ့ ပုံကို ပြန် Update လုပ်လိုက်ပါမယ်
    await prisma.queue.update({
      where: { id: newQueue.id },
      data: { qrCodeString },
    });

    // Ep 43: Cache ဖြတ်ပြီး Page ကို Data အသစ်ဆွဲတင်ခိုင်းမယ်
    revalidatePath("/queue");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "System Error: Queue ယူရာတွင် အခက်အခဲရှိနေပါသည်။" };
  }
}

export async function checkQueueStatusAction(queueId: string) {
  try {
    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      select: { status: true }, // အကုန်မဆွဲဘဲ Status တစ်ခုတည်းကိုပဲ ပေါ့ပေါ့ပါးပါး ဆွဲထုတ်မယ်
    });
    return { status: queue?.status };
  } catch (error) {
    return { error: "Status စစ်ဆေးရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}

export async function cancelQueueAction(queueId: string) {
  try {
    await prisma.queue.update({
      where: { id: queueId },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/queue");
    revalidatePath("/stations"); // ဆီဆိုင်က Queue Count ပြန်ကျသွားအောင်ပါ

    return { success: true };
  } catch (error) {
    return { error: "ဖျက်သိမ်းရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
