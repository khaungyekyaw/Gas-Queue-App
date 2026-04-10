// app/super-admin/dashboard/actions.ts
"use server";

import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// ၁။ authOptions ကို လှမ်း Import လုပ်ထားပါသည်
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const AdminSchema = z.object({
  phoneNo: z.string().min(5, "ဖုန်းနံပါတ် အနည်းဆုံး ၅ လုံး ရှိရပါမည်"),
  password: z.string().min(6, "စကားဝှက် အနည်းဆုံး ၆ လုံး ရှိရပါမည်"),
  stationId: z.string().min(1, "ဆီဆိုင် ရွေးချယ်ပါ"),
});

export async function createStationAdminAction(
  prevState: any,
  formData: FormData,
) {
  // ၂။ getServerSession ထဲမှာ authOptions ကို ထည့်ပေးလိုက်ပါသည်
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") {
    return { error: "လုပ်ပိုင်ခွင့် မရှိပါ။" };
  }

  const validatedFields = AdminSchema.safeParse({
    phoneNo: formData.get("phoneNo"),
    password: formData.get("password"),
    stationId: formData.get("stationId"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { phoneNo, password, stationId } = validatedFields.data;

  try {
    // ဖုန်းနံပါတ် ထပ်နေခြင်း ရှိ/မရှိ စစ်ဆေးခြင်း
    const existingUser = await prisma.user.findUnique({ where: { phoneNo } });
    if (existingUser) {
      return { error: "ဤဖုန်းနံပါတ်ဖြင့် အကောင့်ဖွင့်ပြီးသား ဖြစ်နေပါသည်။" };
    }

    // Admin အကောင့်သစ် ဖန်တီးခြင်း
    await prisma.user.create({
      data: {
        phoneNo,
        password,
        role: "STATION_ADMIN",
        stationId, // ဆိုင်နဲ့ တစ်ခါတည်း ချိတ်ဆက်လိုက်ပါပြီ
      },
    });

    revalidatePath("/super-admin/dashboard");
    return { success: true, message: "Station Admin အသစ် ဖန်တီးပြီးပါပြီ။" };
  } catch (error) {
    return { error: "System Error: အကောင့်ဖန်တီးရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
