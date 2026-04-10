// app/super-admin/users/actions.ts
"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma"; // libs ဖြစ်နေရင် ပြင်ပါ
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function toggleUserArchiveStatus(
  userId: string,
  currentStatus: boolean,
) {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") return { error: "လုပ်ပိုင်ခွင့် မရှိပါ။" };

  // မိမိကိုယ်ကို ပြန် Ban မိခြင်းမှ ကာကွယ်ခြင်း
  if (userId === currentUserId) {
    return { error: "မိမိအကောင့်ကို မိမိကိုယ်တိုင် ပိတ်ခွင့် မရှိပါ။" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isArchived: !currentStatus }, // True ဆို False၊ False ဆို True ပြောင်းမယ်
    });

    revalidatePath("/super-admin/users");
    return { success: true, message: "အကောင့် အခြေအနေ ပြောင်းလဲပြီးပါပြီ။" };
  } catch (error) {
    return { error: "System Error: ပြောင်းလဲရာတွင် အခက်အခဲရှိပါသည်။" };
  }
}
