// app/(customer)/add-vehicle/page.tsx

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AddVehicleForm from "./AddVehicleForm";

export default async function AddVehiclePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  // User ၏ အချက်အလက်အဟောင်းများကို ဆွဲထုတ်မည်
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  // Database ထဲက Active ဖြစ်နေတဲ့ ယာဉ်အမျိုးအစားတွေကို ဆွဲထုတ်မယ်
  const vehicleTypes = await prisma.vehicleType.findMany({
    where: { isArchived: false },
    orderBy: { name: "asc" }, // Ep 35: orderBy သုံးခြင်း
  });

  return (
    <main>
      {/* ဆွဲထုတ်လာတဲ့ Data ကို Client Component ဆီ Props အနေနဲ့ ပို့ပေးလိုက်တယ် */}
      {/* user ကိုပါ အပိုဆောင်း ပို့ပေးလိုက်သည် */}
      <AddVehicleForm vehicleTypes={vehicleTypes} user={user} />
    </main>
  );
}
