// app/(customer)/add-vehicle/actions.ts
"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function addVehicleAction(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Login ဝင်ရန် လိုအပ်ပါသည်" };

  const vehicleTypeId = formData.get("vehicleTypeId") as string;
  const fuelType = formData.get("fuelType") as any;
  const plateNumber = formData.get("plateNumber") as string;

  if (!vehicleTypeId || !fuelType || !plateNumber) {
    return { error: "အချက်အလက်များကို ပြည့်စုံစွာ ဖြည့်သွင်းပါ။" };
  }

  // ယာဉ်နံပါတ်ကို စာလုံးအကြီးပြောင်းပြီး နေရာလွတ်တွေ ဖျက်မယ် (ဥပမာ 1m 1234 -> 1M1234)
  const formattedPlateNumber = plateNumber.toUpperCase().replace(/\s/g, "");

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return { error: "User အကောင့် ရှာမတွေ့ပါ။" };

    const now = new Date();

    // Edit လုပ်တာလား စစ်ဆေးမည်
    const isEditing = !!user.lastVehicleChangeDate;

    if (isEditing && user.lastVehicleChangeDate) {
      const lastChange = new Date(user.lastVehicleChangeDate);
      const hoursDiff =
        (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60);
      const daysDiff = hoursDiff / 24;

      // Rule 1: ယာဉ်နံပါတ် ပြောင်းရင် (၁ ပတ် = ၇ ရက် စောင့်ရမည်)
      if (user.plateNumber !== formattedPlateNumber) {
        if (daysDiff < 7) {
          const waitDays = Math.ceil(7 - daysDiff);
          return {
            error: `ယာဉ်နံပါတ်ကို ၁ ပတ်လျှင် ၁ ကြိမ်သာ ပြင်ခွင့်ရှိပါသည်။ နောက်ထပ် ${waitDays} ရက် စောင့်ပါ။`,
          };
        }
      }

      // Rule 2: ဆီအမျိုးအစား (သို့) ယာဉ်အမျိုးအစား ပြောင်းရင် (၁ ရက် = ၂၄ နာရီ စောင့်ရမည်)
      if (user.fuelType !== fuelType || user.vehicleTypeId !== vehicleTypeId) {
        if (hoursDiff < 24) {
          const waitHours = Math.ceil(24 - hoursDiff);
          return {
            error: `ဆီအမျိုးအစားကို ၁ ရက်လျှင် ၁ ကြိမ်သာ ပြင်ခွင့်ရှိပါသည်။ နောက်ထပ် ${waitHours} နာရီ စောင့်ပါ။`,
          };
        }
      }
    }

    // တခြားသူ ယူထားပြီးသား ယာဉ်နံပါတ်လား စစ်ဆေးမည်
    if (user.plateNumber !== formattedPlateNumber) {
      const existingPlate = await prisma.user.findUnique({
        where: { plateNumber: formattedPlateNumber },
      });
      if (existingPlate) {
        return {
          error: "ဤယာဉ်နံပါတ်မှာ အခြားအကောင့်တွင် မှတ်ပုံတင်ထားပြီး ဖြစ်ပါသည်။",
        };
      }
    }

    // Database တွင် သိမ်းဆည်းမည်
    await prisma.user.update({
      where: { id: user.id },
      data: {
        vehicleTypeId,
        fuelType,
        plateNumber: formattedPlateNumber,
        lastVehicleChangeDate: now, // ပြင်ဆင်ခဲ့တဲ့ အချိန်ကို မှတ်ထားမည်
      },
    });

    revalidatePath("/customers");
    revalidatePath("/add-vehicle");

    return {
      success: true,
      message: "ယာဉ်အချက်အလက် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။",
    };
  } catch (error) {
    console.error(error);
    return { error: "System Error: သိမ်းဆည်းရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
