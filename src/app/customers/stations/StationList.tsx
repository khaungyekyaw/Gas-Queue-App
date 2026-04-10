// app/(customer)/stations/StationList.tsx
"use client";

import LogoutButton from "@/components/LogoutButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Dashboard သို့ ပြန်သွားရန် Icon အသစ်
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"; // Icon အသစ်
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Alert,
  Box, // Alert အသစ်
  Button, // Button အသစ်
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Prisma ကလာမယ့် Data Type
interface Station {
  id: string;
  name: string;
  location: string;
  has92: boolean;
  has95: boolean;
  hasDiesel: boolean;
  dailyQueueLimit: number;
  _count: { queues: number };
}

// ==========================================
// Queue Type အသစ်ကြေညာခြင်း
// ==========================================
interface CurrentQueue {
  id: string;
  queueNumber: number;
  station: { name: string };
}

export default function StationList({
  stations,
  currentQueue, // <--- Props အသစ်လက်ခံခြင်း
}: {
  stations: Station[];
  currentQueue?: CurrentQueue | null;
}) {
  const router = useRouter(); // Ep 23: useRouter for navigation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Browser ပေါ်ရောက်မှ True ပြောင်းမယ်
  }, []);

  // Browser ပေါ် မရောက်သေးခင် (Hydration မပြီးခင်) ဘာမှမပြထားဘူး
  if (!mounted) return null;

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
      {/* ခေါင်းစဉ်နှင့် Logout ခလုတ်ကို ဘေးတိုက်ထားခြင်း */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        {/* ========================================== */}
        {/* Dashboard သို့ ပြန်သွားမည့် Button အသစ်ထည့်သွင်းခြင်း */}
        {/* ========================================== */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/customers")} // Customer Dashboard သို့ ပြန်သွားမည်
          sx={{ fontWeight: "bold", color: "text.secondary" }}
        >
          Dashboard သို့ ပြန်သွားမည်
        </Button>
        <LogoutButton />
      </Box>

      {/* ========================================== */}
      {/* လက်ရှိ Queue အခြေအနေ ပြသမည့် Banner (အသစ်) */}
      {/* ========================================== */}
      {currentQueue ? (
        // Queue ယူထားပြီးပါက အပြာရောင် Banner လေး ပြမည်
        <Card
          sx={{
            mb: 4,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                လူကြီးမင်း၏ လက်ရှိတန်းစီနံပါတ်
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                #{currentQueue.queueNumber}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.5 }}
                display="flex"
                alignItems="center"
                gap={0.5}
              >
                <LocalGasStationIcon fontSize="small" />
                {currentQueue.station.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push(`/customers/queue`)}
              sx={{ fontWeight: "bold", borderRadius: 2 }}
            >
              QR ကြည့်မည်
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Queue မယူရသေးပါက သတိပေး Alert ပြမည်
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ mb: 4, borderRadius: 2 }}
        >
          လက်ရှိတွင် တန်းစီထားခြင်း မရှိသေးပါ။ အောက်ပါဆီဆိုင်များမှ တစ်ခုခုကို
          ရွေးချယ်၍ Queue ရယူပါ။
        </Alert>
      )}
      <Typography variant="h5" fontWeight="bold" mb={2}>
        ဆီဆိုင်များ
      </Typography>

      <Stack spacing={2}>
        {stations.length === 0 ? (
          <Typography textAlign="center" color="error" sx={{ mt: 5 }}>
            ယခုအချိန်တွင် ဖွင့်လှစ်ထားသော ဆီဆိုင် မရှိသေးပါ။
          </Typography>
        ) : (
          stations.map((station) => {
            // Queue ရာခိုင်နှုန်း တွက်ချက်ခြင်း
            const isFull = station._count.queues >= station.dailyQueueLimit;
            const progress =
              (station._count.queues / station.dailyQueueLimit) * 100;

            return (
              <Card
                key={station.id}
                variant="outlined"
                sx={{ borderRadius: 3, opacity: isFull ? 0.6 : 1 }}
              >
                {/* ဆိုင်ကို နှိပ်လိုက်ရင် /queue page ကို stationId သယ်ပြီး သွားမယ် */}
                <CardActionArea
                  disabled={isFull}
                  onClick={
                    () =>
                      router.push(`/customers/queue?stationId=${station.id}`) // Route Group (customer) သုံးထားပါက /queue လို့ပဲ ခေါ်ရပါမယ်
                  }
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={1}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <LocalGasStationIcon color="primary" />
                        {station.name}
                      </Typography>
                      {/* Queue အခြေအနေ ပြသခြင်း */}
                      <Chip
                        label={isFull ? "Queue ပြည့်သွားပါပြီ" : "Queue ယူရန်"}
                        color={isFull ? "error" : "success"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mb={2}
                    >
                      <LocationOnIcon fontSize="small" />
                      {station.location}
                    </Typography>

                    {/* ရနိုင်တဲ့ ဆီအမျိုးအစားများ (Tags) */}
                    <Stack direction="row" spacing={1} mb={3}>
                      {station.has92 && (
                        <Chip
                          label="92 Ron"
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                      {station.has95 && (
                        <Chip
                          label="95 Ron"
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                      {station.hasDiesel && (
                        <Chip
                          label="Diesel"
                          size="small"
                          variant="outlined"
                          color="warning"
                        />
                      )}
                    </Stack>

                    {/* Queue Limit & Progress Bar */}
                    <Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.5}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="bold"
                        >
                          လက်ခံမည့် အရေအတွက်
                        </Typography>
                        <Typography
                          variant="caption"
                          color={isFull ? "error" : "text.primary"}
                          fontWeight="bold"
                        >
                          {station._count.queues} / {station.dailyQueueLimit}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress > 100 ? 100 : progress}
                        color={isFull ? "error" : "primary"}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })
        )}
      </Stack>
    </Container>
  );
}
