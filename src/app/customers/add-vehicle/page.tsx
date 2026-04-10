// app/(customer)/add-vehicle/page.tsx

import { prisma } from "@/libs/prisma";
import AddVehicleForm from "./AddVehicleForm";

export default async function AddVehiclePage() {
  // Database ထဲက Active ဖြစ်နေတဲ့ ယာဉ်အမျိုးအစားတွေကို ဆွဲထုတ်မယ်
  const vehicleTypes = await prisma.vehicleType.findMany({
    where: { isArchived: false },
    orderBy: { name: "asc" }, // Ep 35: orderBy သုံးခြင်း
  });

  return (
    <main>
      {/* ဆွဲထုတ်လာတဲ့ Data ကို Client Component ဆီ Props အနေနဲ့ ပို့ပေးလိုက်တယ် */}
      <AddVehicleForm vehicleTypes={vehicleTypes} />
    </main>
  );
}
