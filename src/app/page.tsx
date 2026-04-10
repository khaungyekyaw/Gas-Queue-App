// app/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import TimerIcon from "@mui/icons-material/Timer";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
} from "@mui/material";
import { getServerSession } from "next-auth";

export default async function LandingPage() {
  // လက်ရှိ ဝင်ရောက်ထားသော Session ကို စစ်ဆေးခြင်း
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  // Role ပေါ်မူတည်၍ သွားရမည့် လင့်ခ်ကို သတ်မှတ်ခြင်း
  let dashboardLink = "/customers"; // Default အနေဖြင့် Customer ဆီသွားမည်
  if (role === "SUPER_ADMIN") dashboardLink = "/super-admin/dashboard";
  if (role === "STATION_ADMIN") dashboardLink = "/station-admin/dashboard";

  return (
    <main>
      {/* ========================================== */}
      {/* 1. Hero Section (ပင်မ ဆွဲဆောင်မှုအပိုင်း) */}
      {/* ========================================== */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: { xs: 8, md: 12 },
          textAlign: "center",
          borderRadius: { xs: "0 0 30px 30px", md: "0 0 50px 50px" },
          boxShadow: 3,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
          >
            ထားဝယ် ဆီတန်းစီစနစ်
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.9, mb: 5, fontWeight: "normal" }}
          >
            အချိန်ကုန်သက်သာပြီး စနစ်ကျသော ဆီဖြည့်တင်းခြင်း ဝန်ဆောင်မှု။ <br />
            ဖုန်းမှတစ်ဆင့် တန်းစီနံပါတ်ကြိုယူပြီးမှသာ ဆီဆိုင်သို့ သွားရောက်ပါ။
          </Typography>

          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="center"
            gap={2}
          >
            {/* Login ဝင်ထားပြီးသားဆိုရင် Dashboard ကိုတန်းသွားမယ့် ခလုတ် */}
            {session ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                href={dashboardLink}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: "1.1rem",
                  borderRadius: 3,
                  fontWeight: "bold",
                }}
              >
                Dashboard သို့ သွားမည်
              </Button>
            ) : (
              // Login မဝင်ရသေးရင် Customer နဲ့ Admin ခွဲပြမည်
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  href="/customers" // Middleware သို့မဟုတ် Route ကနေ Login ကို အလိုလို ကန်ပို့ပါလိမ့်မည်
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    fontWeight: "bold",
                  }}
                >
                  ဆီဖြည့်ရန် တန်းစီမည် (Customer)
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  href="/login"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                    borderRadius: 3,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Admins only
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* ========================================== */}
      {/* 2. How It Works Section (အသုံးပြုပုံ အဆင့်ဆင့်) */}
      {/* ========================================== */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={6}>
          အသုံးပြုပုံ အဆင့်ဆင့်
        </Typography>

        <Grid container spacing={4}>
          {/* အဆင့် ၁ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 4,
                textAlign: "center",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ py: 5 }}>
                <Box
                  bgcolor="primary.50"
                  color="primary.main"
                  width={80}
                  height={80}
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb={3}
                >
                  <LocalGasStationIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ၁။ ဆီဆိုင်ရွေးချယ်ပါ
                </Typography>
                <Typography color="text.secondary">
                  မိမိနှင့် အနီးဆုံး သို့မဟုတ် ဆီသွားရောက်ဖြည့်တင်းလိုသော
                  ဆီဆိုင်ကို စာရင်းထဲမှ ရွေးချယ်ပါ။
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* အဆင့် ၂ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 4,
                textAlign: "center",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ py: 5 }}>
                <Box
                  bgcolor="secondary.50"
                  color="secondary.main"
                  width={80}
                  height={80}
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb={3}
                >
                  <TimerIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ၂။ တန်းစီနံပါတ် ယူပါ
                </Typography>
                <Typography color="text.secondary">
                  လူကြီးမင်း၏ ယာဉ်အချက်အလက်ကို ထည့်သွင်း၍ Queue ရယူပါ။ ရရှိလာသော
                  QR Code ကို သိမ်းထားပါ။
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* အဆင့် ၃ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 4,
                textAlign: "center",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent sx={{ py: 5 }}>
                <Box
                  bgcolor="success.50"
                  color="success.main"
                  width={80}
                  height={80}
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb={3}
                >
                  <QrCodeScannerIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ၃။ Scan ဖတ်၍ ဆီဖြည့်ပါ
                </Typography>
                <Typography color="text.secondary">
                  ဆီဆိုင်သို့ရောက်သောအခါ ဝန်ထမ်းအား QR Code ပြသ၍
                  လွယ်ကူလျင်မြန်စွာ ဆီဖြည့်တင်းနိုင်ပါသည်။
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ========================================== */}
      {/* 3. Simple Footer */}
      {/* ========================================== */}
      <Box bgcolor="grey.100" py={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Dawei Fuel Queue Management System. All
          rights reserved.
        </Typography>
      </Box>
    </main>
  );
}
