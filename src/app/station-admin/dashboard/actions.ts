// app/station-admin/dashboard/actions.ts
"use server";

import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Zod Validation (Ep 38)
const StationUpdateSchema = z.object({
  stationId: z.string(),
  isOpen: z.boolean(),
  has92: z.boolean(),
  has95: z.boolean(),
  hasDiesel: z.boolean(),
  dailyQueueLimit: z.number().min(1, "Queue အရေအတွက် အနည်းဆုံး ၁ ခု ရှိရပါမည်"),
});

export async function updateStationSettingsAction(
  prevState: any,
  formData: FormData,
) {
  const session = await getServerSession();
  const role = (session?.user as any)?.role;

  // Security Check: Station Admin သာ ပြင်ခွင့်ရှိသည်
  if (role !== "STATION_ADMIN" && role !== "SUPER_ADMIN") {
    return { error: "လုပ်ပိုင်ခွင့် မရှိပါ။" };
  }

  const validatedFields = StationUpdateSchema.safeParse({
    stationId: formData.get("stationId"),
    isOpen: formData.get("isOpen") === "on", // Checkbox value ကို boolean ပြောင်းခြင်း
    has92: formData.get("has92") === "on",
    has95: formData.get("has95") === "on",
    hasDiesel: formData.get("hasDiesel") === "on",
    dailyQueueLimit: Number(formData.get("dailyQueueLimit")),
  });

  if (!validatedFields.success) return { error: "အချက်အလက် မှားယွင်းနေပါသည်။" };

  try {
    const data = validatedFields.data;

    // Database Update (Ep 25)
    await prisma.station.update({
      where: { id: data.stationId },
      data: {
        isOpen: data.isOpen,
        has92: data.has92,
        has95: data.has95,
        hasDiesel: data.hasDiesel,
        dailyQueueLimit: data.dailyQueueLimit,
      },
    });

    // Cache ဖျက်ပြီး Data အသစ်ဆွဲတင်ခြင်း (Ep 43)
    revalidatePath("/station-admin/dashboard");
    revalidatePath("/stations"); // Customer တွေဘက်မှာပါ ချက်ချင်း update ဖြစ်သွားအောင်

    return { success: true, message: "အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ။" };
  } catch (error) {
    return { error: "System Error: သိမ်းဆည်းရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
