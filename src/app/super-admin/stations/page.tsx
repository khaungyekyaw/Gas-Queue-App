// app/super-admin/stations/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CreateStationForm from "./CreateStationForm";

export default async function SuperAdminStationsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== "SUPER_ADMIN") redirect("/login");

  // လက်ရှိ ဖွင့်ထားသော ဆီဆိုင်စာရင်းများကို ဆွဲထုတ်မယ်
  const stations = await prisma.station.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      {/* Navigation Link လေးပါ တစ်ခါတည်း ထည့်ပေးထားပါတယ် */}
      <Box
        mb={4}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight="bold">
          ဆီဆိုင်များ စီမံခန့်ခွဲခြင်း
        </Typography>
        <Typography
          component="a"
          href="/super-admin/dashboard"
          sx={{
            color: "primary.main",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          &larr; Dashboard သို့ ပြန်သွားမည်
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ဘယ်ဘက်: Form */}
        <Grid size={{ xs: 12, md: 5 }}>
          <CreateStationForm />
        </Grid>

        {/* ညာဘက်: ဆီဆိုင်စာရင်းများ */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            လက်ရှိ ဆီဆိုင်စာရင်း ({stations.length} ဆိုင်)
          </Typography>

          <Grid container spacing={2}>
            {stations.map((station) => (
              <Grid size={{ xs: 12, md: 6 }} key={station.id}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 2, height: "100%" }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mb={1}
                    >
                      <LocalGasStationIcon color="primary" fontSize="small" />
                      {station.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      mb={2}
                      sx={{ minHeight: "40px" }}
                    >
                      {station.location}
                    </Typography>

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Chip
                        label={station.isOpen ? "ဖွင့်ထားသည်" : "ပိတ်ထားသည်"}
                        color={station.isOpen ? "success" : "error"}
                        size="small"
                      />
                      <Typography variant="caption" fontWeight="bold">
                        Limit: {station.dailyQueueLimit}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
