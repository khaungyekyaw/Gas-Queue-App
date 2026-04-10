// app/super-admin/stations/actions.ts
"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma"; // libs ဖြစ်နေရင် ပြင်ပါ
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const StationSchema = z.object({
  name: z.string().min(2, "ဆီဆိုင်အမည် ထည့်သွင်းပါ"),
  location: z.string().min(5, "လိပ်စာ အပြည့်အစုံ ထည့်သွင်းပါ"),
  dailyQueueLimit: z.number().min(10, "အနည်းဆုံး Queue ၁၀ စီး လက်ခံရပါမည်"),
});

export async function createStationAction(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") return { error: "လုပ်ပိုင်ခွင့် မရှိပါ။" };

  const validatedFields = StationSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    dailyQueueLimit: Number(formData.get("dailyQueueLimit")),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { name, location, dailyQueueLimit } = validatedFields.data;

  try {
    // Database ထဲသို့ ဆီဆိုင်အသစ် ထည့်သွင်းခြင်း (Ep 25)
    await prisma.station.create({
      data: {
        name,
        location,
        dailyQueueLimit,
        // isOpen, has92, has95 စတာတွေက Schema မှာ @default(true) ပေးထားပြီးသားမို့ ထည့်စရာမလိုပါဘူး
      },
    });

    // Cache ဖြတ်ခြင်း
    revalidatePath("/super-admin/stations");
    revalidatePath("/super-admin/dashboard"); // Dashboard က dropdown မှာပါ ချက်ချင်းပေါ်သွားအောင်လို့ပါ
    revalidatePath("/stations"); // Customer တွေဆီမှာပါ တန်းပေါ်သွားအောင်

    return {
      success: true,
      message: "ဆီဆိုင်အသစ် အောင်မြင်စွာ ဖွင့်လှစ်ပြီးပါပြီ။",
    };
  } catch (error) {
    return { error: "System Error: သိမ်းဆည်းရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
