// app/station-admin/dashboard/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma";
import { Container, Typography } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StationSettingsForm from "./StationSettingsForm";

export default async function StationAdminDashboard() {
  const session = await getServerSession(authOptions);

  // ပြင်ဆင်လိုက်သော အပိုင်း (Email အစား ID ဖြင့် စစ်ဆေးခြင်း)
  // ==========================================
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  // ၁။ ဒီ Admin ရဲ့ အကောင့်ကို ရှာမယ်
  const adminUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { stationId: true },
  });

  if (!adminUser?.stationId) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          လူကြီးမင်း၏ အကောင့်အား မည်သည့်ဆီဆိုင်နှင့်မျှ ချိတ်ဆက်ထားခြင်း
          မရှိသေးပါ။
        </Typography>
        <Typography color="text.secondary">
          Super Admin အား ဆက်သွယ်ပါ။
        </Typography>
      </Container>
    );
  }

  // ၂။ ဒီနေ့ Queue အရေအတွက် တွက်ဖို့
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ၃။ Admin ကိုင်ရတဲ့ ဆိုင်အချက်အလက်ကို ဆွဲထုတ်မယ် (Queue Count ပါ တွဲယူမယ်)
  const station = await prisma.station.findUnique({
    where: { id: adminUser.stationId },
    include: {
      _count: {
        select: { queues: { where: { createdAt: { gte: today } } } },
      },
    },
  });

  if (!station) return <Typography>Station not found</Typography>;

  return (
    <main>
      <StationSettingsForm station={station} />
    </main>
  );
}
