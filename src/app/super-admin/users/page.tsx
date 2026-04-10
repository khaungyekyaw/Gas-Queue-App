// app/super-admin/users/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma";
import { Box, Button, Container, Typography } from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserTable from "./UserTable";

export default async function SuperAdminUsersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") redirect("/login");

  // Database ထဲက User အားလုံးကို ဆွဲထုတ်မယ် (Super Admin တွေကိုပါ ပြထားမယ်)
  const users = await prisma.user.findMany({
    include: {
      station: { select: { name: true } }, // ဝန်ထမ်းဆိုရင် ဘယ်ဆိုင်ကလဲဆိုတာ ပြချင်လို့ပါ
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      {/* Navigation Header */}
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold">
          Users စီမံခန့်ခွဲခြင်း
        </Typography>
        <Button
          href="/super-admin/dashboard"
          variant="text"
          sx={{ fontWeight: "bold" }}
        >
          &larr; Dashboard သို့ ပြန်သွားမည်
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" mb={3}>
        စနစ်ထဲတွင် မှတ်ပုံတင်ထားသော သုံးစွဲသူများနှင့် ဝန်ထမ်းများ စုစုပေါင်း (
        {users.length}) ဦး ရှိပါသည်။ စည်းကမ်းမလိုက်နာသော User များကို Ban
        နိုင်ပါသည်။
      </Typography>

      {/* Client Component ဆီသို့ Data ပို့ခြင်း */}
      <UserTable users={users} />
    </Container>
  );
}
