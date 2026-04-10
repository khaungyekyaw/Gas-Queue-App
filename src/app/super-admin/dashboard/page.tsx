// app/super-admin/dashboard/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton";
import { prisma } from "@/libs/prisma";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CreateAdminForm from "./CreateAdminForm";

export default async function SuperAdminDashboard() {
  // ၂။ getServerSession ထဲမှာ authOptions ကို မဖြစ်မနေ ထည့်ပေးရပါမယ်
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") redirect("/login");

  // ၁။ ဆီဆိုင်စာရင်းများကို ဆွဲထုတ်မယ် (Form မှာ ရွေးဖို့)
  const stations = await prisma.station.findMany({
    where: { isArchived: false },
    orderBy: { name: "asc" },
  });

  // ၂။ လက်ရှိ Station Admin များကို ဆွဲထုတ်မယ် (စာရင်းပြဖို့)
  const stationAdmins = await prisma.user.findMany({
    where: { role: "STATION_ADMIN" },
    include: { station: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container maxWidth="md" sx={{ pt: 4, pb: 6 }}>
      {/* ခေါင်းစဉ်နှင့် Logout ခလုတ်ကို ဘေးတိုက်ထားခြင်း */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="h4" fontWeight="bold">
          Super Admin Dashboard
        </Typography>
        <LogoutButton /> {/* <--- ဒီမှာ ထည့်ပါ */}
      </Box>
      <Typography variant="body1" color="text.secondary" mb={4}>
        စနစ်တစ်ခုလုံးရှိ ဆီဆိုင်များနှင့် ဝန်ထမ်းများကို စီမံခန့်ခွဲပါ။
      </Typography>
      <Box display="flex" gap={2} mb={4}>
        <Button href="/super-admin/stations" variant="contained">
          ဆီဆိုင်များ စီမံရန်
        </Button>
        <Button href="/super-admin/users" variant="outlined" color="secondary">
          Users အားလုံး ကြည့်ရှုရန်
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* ဘယ်ဘက်: အကောင့်သစ် ဖန်တီးရန် Form */}
        <Grid size={{ xs: 12, md: 5 }}>
          <CreateAdminForm stations={stations} />
        </Grid>

        {/* ညာဘက်: လက်ရှိ Admin စာရင်းပြသရန် */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            လက်ရှိ ဆီဆိုင်မန်နေဂျာများ
          </Typography>
          {stationAdmins.length === 0 ? (
            <Typography color="text.secondary">စာရင်း မရှိသေးပါ။</Typography>
          ) : (
            stationAdmins.map((admin) => (
              <Card
                key={admin.id}
                variant="outlined"
                sx={{ mb: 2, borderRadius: 2 }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ဖုန်း: {admin.phoneNo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    စကားဝှက်: {admin.password}
                  </Typography>
                  <Chip
                    label={admin.station?.name || "ဆိုင်မချိတ်ရသေးပါ"}
                    color={admin.station ? "primary" : "default"}
                    size="small"
                  />
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
