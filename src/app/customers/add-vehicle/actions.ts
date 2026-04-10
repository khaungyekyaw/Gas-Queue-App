// app/(customer)/add-vehicle/actions.ts
"use server";

import { prisma } from "@/libs/prisma";
import { FuelType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const VehicleSchema = z.object({
  vehicleTypeId: z.string().min(1, "ယာဉ်အမျိုးအစား ရွေးချယ်ပါ"),

  // Zod ရဲ့ z.nativeEnum() ကို သုံးပြီး Prisma Enum နဲ့ ချိတ်ဆက်လိုက်တယ်
  fuelType: z.nativeEnum(FuelType, {
    message: "ဆီအမျိုးအစား ရွေးချယ်ပါ",
  }),

  plateNumber: z
    .string()
    .min(2, "ယာဉ်နံပါတ် အနည်းဆုံး ၂ လုံး ထည့်ပါ")
    .transform((val) => val.replace(/[\s-]/g, "").toUpperCase()),
});

export async function addVehicleAction(prevState: any, formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) return { error: "Login ဝင်ရန် လိုအပ်ပါသည်" };

  const validatedFields = VehicleSchema.safeParse({
    vehicleTypeId: formData.get("vehicleTypeId"),
    fuelType: formData.get("fuelType"), // <--- Data ယူတယ်
    plateNumber: formData.get("plateNumber"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { vehicleTypeId, fuelType, plateNumber } = validatedFields.data;

  try {
    const existingVehicle = await prisma.user.findUnique({
      where: { plateNumber },
    });
    if (existingVehicle && existingVehicle.email !== session.user.email) {
      return {
        error: "ဤယာဉ်နံပါတ်သည် အခြားအကောင့်တစ်ခုနှင့် ချိတ်ဆက်ထားပြီးဖြစ်ပါသည်",
      };
    }

    // Database Update လုပ်တဲ့အခါ fuelType ပါ ထည့်သိမ်းတယ်
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        plateNumber,
        vehicleTypeId,
        fuelType: fuelType as any, // Enum type ချိတ်ဆက်ခြင်း
        lastVehicleChangeDate: new Date(),
      },
    });
  } catch (error) {
    return { error: "System Error: ဒေတာသိမ်းဆည်းရာတွင် အခက်အခဲရှိနေပါသည်" };
  }

  redirect("/customers/stations");
}
