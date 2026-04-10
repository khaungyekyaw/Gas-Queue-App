// app/station-admin/scan/actions.ts
"use server";

import { prisma } from "@/libs/prisma";
import { revalidatePath } from "next/cache";

export async function verifyAndCompleteQueueAction(
  queueId: string,
  stationId: string,
) {
  try {
    // ၁။ Queue ကို ရှာမယ် (Customer ရဲ့ ယာဉ်နံပါတ်ပါ တစ်ခါတည်း ဆွဲထုတ်မယ်)
    const queue = await prisma.queue.findUnique({
      where: { id: queueId },
      include: { customer: true },
    });

    if (!queue) return { error: "QR Code မှားယွင်းနေပါသည် (သို့) မရှိပါ။" };

    // ၂။ Security Checks (Rule များစစ်ဆေးခြင်း)
    if (queue.stationId !== stationId) {
      return { error: "ဤ QR Code သည် အခြားဆီဆိုင်အတွက် ဖြစ်ပါသည်။" };
    }
    if (queue.status === "COMPLETED") {
      return { error: "ဤ Queue အား ဆီဖြည့်ပေးပြီး ဖြစ်ပါသည်။" };
    }
    if (queue.status !== "PENDING") {
      return {
        error: `ဤ Queue သည် အသုံးပြု၍မရတော့ပါ (Status: ${queue.status})`,
      };
    }

    // ၃။ အားလုံးမှန်ကန်ရင် Status ကို COMPLETED ပြောင်းမယ်
    await prisma.queue.update({
      where: { id: queueId },
      data: { status: "COMPLETED" },
    });

    // ၄။ UI တွေ အကုန် Update ဖြစ်သွားအောင် Cache ဖြတ်မယ်
    revalidatePath("/station-admin/dashboard");

    return {
      success: true,
      message: `ယာဉ်အမှတ် [${queue.customer.plateNumber}] အား ${queue.requestedFuelType} ဆီဖြည့်ခွင့် ပြုလိုက်ပါပြီ။`,
    };
  } catch (error) {
    return { error: "System Error: စစ်ဆေးရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
