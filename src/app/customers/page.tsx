// app/customers/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "@/components/LogoutButton"; // အရင်က ရေးခဲ့တဲ့ Logout ခလုတ်
import { prisma } from "@/libs/prisma"; // libs/prisma ဖြစ်နေရင် ပြင်ပါ
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login?callbackUrl=/customers");

  // ၁။ User ရဲ့ အချက်အလက်များကို ဆွဲထုတ်မည်
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  // ၂။ ဒီနေ့အတွက် နေ့စွဲနဲ့ လက်ရှိ Active ဖြစ်နေသော Queue ရှိ/မရှိ စစ်ဆေးမည်
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentQueue = await prisma.queue.findFirst({
    where: {
      customerId: user.id,
      status: "PENDING",
      createdAt: { gte: today },
    },
    include: {
      station: { select: { name: true } },
    },
  });

  // ၃။ ကားအချက်အလက် ပြည့်စုံမှု ရှိမရှိ စစ်ဆေးခြင်း
  const hasVehicleInfo = !!(user.plateNumber && user.fuelType);

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 6 }}>
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: "primary.main", width: 50, height: 50 }}>
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              မင်္ဂလာပါ, {user.name || "Customer"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.phoneNo}
            </Typography>
          </Box>
        </Box>
        <LogoutButton />
      </Box>

      {/* ========================================== */}
      {/* Dynamic Status Banner (အခြေအနေအလိုက် ပြောင်းလဲမည်) */}
      {/* ========================================== */}
      {!hasVehicleInfo ? (
        <Card
          sx={{
            mb: 4,
            bgcolor: "#fff3e0",
            border: "1px solid #ffb74d",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <WarningAmberIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography
              variant="h6"
              fontWeight="bold"
              color="warning.dark"
              gutterBottom
            >
              ယာဉ်အချက်အလက် လိုအပ်နေပါသည်
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              တန်းစီနံပါတ် မယူမီ လူကြီးမင်း၏ ယာဉ်နံပါတ်နှင့် ဆီအမျိုးအစားကို
              ဦးစွာ ထည့်သွင်းပေးပါ။
            </Typography>
            <Button
              variant="contained"
              color="warning"
              href="/customers/add-vehicle"
              sx={{ borderRadius: 2 }}
            >
              အချက်အလက် သွင်းမည်
            </Button>
          </CardContent>
        </Card>
      ) : currentQueue ? (
        <Card
          sx={{
            mb: 4,
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent sx={{ py: 4, textAlign: "center" }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 50, mb: 1, opacity: 0.9 }}
            />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              တန်းစီနံပါတ် ရရှိထားပါသည်
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              {currentQueue.station.name} တွင် Queue No: #
              {currentQueue.queueNumber} အား ရယူထားပါသည်။
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              href="/customers/queue"
              sx={{ fontWeight: "bold", borderRadius: 2, px: 4 }}
            >
              QR Code ပြသရန်
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          sx={{
            mb: 4,
            bgcolor: "#f0fdf4",
            border: "1px solid #4ade80",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ textAlign: "center", py: 3 }}>
            <LocalGasStationIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography
              variant="h6"
              fontWeight="bold"
              color="success.main"
              gutterBottom
            >
              ဆီဖြည့်ရန် အဆင်သင့်ဖြစ်ပါသည်
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              အနီးနားရှိ ဆီဆိုင်များကို ရွေးချယ်၍ တန်းစီနံပါတ် ရယူနိုင်ပါသည်။
            </Typography>
            <Button
              variant="contained"
              color="success"
              href="/customers/stations"
              sx={{ borderRadius: 2 }}
            >
              ဆီဆိုင်များ ကြည့်မည်
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ========================================== */}
      {/* Main Navigation Menu (ခလုတ်ကြီးများ) */}
      {/* ========================================== */}
      <Typography variant="h6" fontWeight="bold" mb={2}>
        ဝန်ဆောင်မှုများ
      </Typography>

      <Grid container spacing={2}>
        {/* ၁။ ဆီဆိုင်များသို့ သွားရန် */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardActionArea
              href="/customers/stations"
              sx={{ height: "100%", p: 2 }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
              >
                <LocalGasStationIcon
                  color="primary"
                  sx={{ fontSize: 40, mb: 1 }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  ဆီဆိုင်များ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ဖွင့်လှစ်ထားသော ဆီဆိုင်များတွင် Queue ယူရန်
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>

        {/* ၂။ မိမိ၏ Queue QR Code ကြည့်ရန် */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardActionArea
              href="/customers/queue"
              sx={{ height: "100%", p: 2 }}
            >
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                textAlign="center"
              >
                <QrCode2Icon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  တန်းစီနံပါတ်
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  မိမိ၏ လက်ရှိ Queue နှင့် QR Code ကြည့်ရန်
                </Typography>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>

        {/* ၃။ ယာဉ်အချက်အလက် ပြင်ဆင်ရန် */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardActionArea href="/customers/add-vehicle" sx={{ p: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box bgcolor="grey.100" p={1.5} borderRadius={2} display="flex">
                  <DirectionsCarIcon color="action" />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ယာဉ်အချက်အလက်
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {hasVehicleInfo
                      ? `${user.plateNumber} (${user.fuelType})`
                      : "အချက်အလက် မသွင်းရသေးပါ"}
                  </Typography>
                </Box>
                <Button variant="text" size="small">
                  {hasVehicleInfo ? "ပြင်မည်" : "ထည့်မည်"}
                </Button>
              </Box>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
