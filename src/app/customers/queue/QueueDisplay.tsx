// app/(customer)/queue/QueueDisplay.tsx
"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Back Button အတွက်
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"; // Cancel အတွက်
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText, // Dialog တွေ အသစ်ထည့်ထားပါတယ်
  DialogTitle,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  cancelQueueAction,
  checkQueueStatusAction,
  takeQueueAction,
} from "./actions"; // cancelQueueAction ထပ်ထည့်ထားပါတယ်

// Server ကနေ ကျလာမယ့် User ရဲ့ လက်ရှိ Queue (ရှိခဲ့ရင်)
interface CurrentQueue {
  id: string;
  queueNumber: number;
  qrCodeString: string;
  status: string;
  station: { name: string; location: string };
  requestedFuelType: string | null;
}

export default function QueueDisplay({
  stationId,
  currentQueue,
}: {
  stationId?: string;
  currentQueue?: CurrentQueue | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time Status ကို သိမ်းထားမယ့် State
  const [liveStatus, setLiveStatus] = useState<string>(
    currentQueue?.status || "PENDING",
  );

  // Cancel Dialog အတွက် States
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // ==========================================
  // Hook များအားလုံး (useEffect များ) ကို Early Return မတိုင်မီ အပေါ်ဆုံးတွင် ထားရှိရပါမည်
  // ==========================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // ==========================================
  // Ep 45: Real-time Polling (setInterval)
  // (ဒီ useEffect ကို အပေါ်သို့ ရွှေ့လိုက်ပါပြီ)
  // ==========================================
  useEffect(() => {
    if (currentQueue?.id && liveStatus === "PENDING") {
      const interval = setInterval(async () => {
        const res = await checkQueueStatusAction(currentQueue.id);
        if (res.status && res.status !== "PENDING") {
          setLiveStatus(res.status);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentQueue?.id, liveStatus]);

  // Hook များ အားလုံးခေါ်ပြီးမှသာ Early Return လုပ်ရပါမည်
  // Browser ပေါ် မရောက်သေးခင် ဘာမှမပြထားဘူး
  if (!mounted) return null;

  const handleTakeQueue = async () => {
    if (!stationId) return;
    setLoading(true);
    setError(null);

    const res = await takeQueueAction(stationId);

    if (res?.error) {
      setError(res.error);
      if (res.redirect) router.push(res.redirect);
    }
    setLoading(false);
  };

  // ==========================================
  // Queue ဖျက်မည့် Function အသစ်
  // ==========================================
  const handleCancelQueue = async () => {
    if (!currentQueue?.id) return;
    setCancelling(true);
    const res = await cancelQueueAction(currentQueue.id);

    if (res.error) {
      setError(res.error);
    } else {
      setLiveStatus("CANCELLED"); // UI ကို Cancelled လို့ ချက်ချင်း ပြောင်းပြမယ်
      setOpenCancelDialog(false);
    }
    setCancelling(false);
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 4, textAlign: "center" }}>
      {/* ========================================== */}
      {/* 1. အနောက်သို့ ပြန်သွားမည့် Back Button (Queue မဖျက်ပါ) */}
      {/* ========================================== */}
      <Box display="flex" justifyContent="flex-start" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/customers/stations")}
          sx={{ fontWeight: "bold", color: "text.secondary" }}
        >
          ဆီဆိုင်များသို့ ပြန်သွားမည်
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {currentQueue ? (
        liveStatus === "COMPLETED" ? (
          // ==========================================
          // ဆီဖြည့်ပြီးသွားသောအခါ ပြမည့် UI
          // ==========================================
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              bgcolor: "#f0fdf4",
              border: "1px solid #4ade80",
            }}
          >
            <CardContent sx={{ py: 6 }}>
              <CheckCircleOutlineIcon
                color="success"
                sx={{ fontSize: 80, mb: 2 }}
              />
              <Typography
                variant="h5"
                fontWeight="bold"
                color="success.main"
                gutterBottom
              >
                ဆီဖြည့်ပြီးပါပြီ
              </Typography>
              <Typography color="text.secondary">
                လူကြီးမင်း၏ ယာဉ်အမှတ် #{currentQueue.queueNumber} အား
                ဆီဖြည့်တင်းခြင်း အောင်မြင်ပါသည်။
              </Typography>
              <Button
                variant="outlined"
                color="success"
                sx={{ mt: 4 }}
                onClick={() => router.push("/customers/stations")}
              >
                ပင်မစာမျက်နှာသို့ ပြန်သွားမည်
              </Button>
            </CardContent>
          </Card>
        ) : liveStatus === "CANCELLED" ? (
          // ==========================================
          // Queue ကို ကိုယ်တိုင် ဖျက်လိုက်သောအခါ ပြမည့် UI အသစ်
          // ==========================================
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              bgcolor: "#fff0f0",
              border: "1px solid #f87171",
            }}
          >
            <CardContent sx={{ py: 6 }}>
              <CancelOutlinedIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
              <Typography
                variant="h5"
                fontWeight="bold"
                color="error.main"
                gutterBottom
              >
                တန်းစီခြင်း ပယ်ဖျက်ပြီးပါပြီ
              </Typography>
              <Typography color="text.secondary">
                လူကြီးမင်း၏ တန်းစီနံပါတ်ကို အောင်မြင်စွာ ဖျက်သိမ်းပြီး
                ဖြစ်ပါသည်။ အခြားဆီဆိုင်များတွင် Queue အသစ် ပြန်ယူနိုင်ပါသည်။
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 4, borderRadius: 2 }}
                onClick={() => router.push("/stations")}
              >
                ဆီဆိုင်များသို့ ပြန်သွားမည်
              </Button>
            </CardContent>
          </Card>
        ) : (
          // ==========================================
          // Queue ရပြီးသားသူများအတွက် ပြမည့် QR UI (PENDING)
          // ==========================================
          <Box>
            <Card
              sx={{ borderRadius: 4, boxShadow: 4, overflow: "hidden", mb: 3 }}
            >
              <Box bgcolor="primary.main" color="white" py={2}>
                <Typography variant="h6" fontWeight="bold">
                  လူကြီးမင်း၏ တန်းစီနံပါတ်
                </Typography>
                <Typography variant="h2" fontWeight="bold">
                  #{currentQueue.queueNumber}
                </Typography>
              </Box>
              <CardContent sx={{ pt: 4, pb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {currentQueue.station.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {currentQueue.station.location}
                </Typography>

                <Box mb={3} display="flex" justifyContent="center">
                  <img
                    src={currentQueue.qrCodeString}
                    alt="QR Code"
                    style={{
                      width: "200px",
                      height: "200px",
                      borderRadius: "10px",
                    }}
                  />
                </Box>

                <Alert
                  severity="info"
                  icon={<QrCode2Icon />}
                  sx={{ textAlign: "left", borderRadius: 2 }}
                >
                  ဆီဆိုင်သို့ရောက်ပါက ဤ QR Code အား တာဝန်ကျဝန်ထမ်းကို ပြသပေးပါ။
                  <br />
                  <strong>
                    ဆီအမျိုးအစား:{" "}
                    {currentQueue.requestedFuelType || "သတ်မှတ်မထားပါ"}
                  </strong>
                </Alert>
              </CardContent>
            </Card>

            {/* ========================================== */}
            {/* 2. Queue ကို ဖျက်မည့် Cancel Button (အနီရောင်) */}
            {/* ========================================== */}
            <Button
              variant="text"
              color="error"
              onClick={() => setOpenCancelDialog(true)}
              sx={{ fontWeight: "bold" }}
            >
              တန်းစီခြင်းကို ပယ်ဖျက်မည်
            </Button>
          </Box>
        )
      ) : (
        // ==========================================
        // Queue မယူရသေးသူများအတွက် ပြမည့် UI
        // ==========================================
        <Box mt={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            တန်းစီနံပါတ် ရယူမည်
          </Typography>
          <Typography color="text.secondary" mb={4}>
            စည်းကမ်းချက်များကို သဘောတူပါက အောက်ပါခလုတ်ကို နှိပ်၍ Queue
            ရယူနိုင်ပါသည်။
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={handleTakeQueue}
            disabled={loading || !stationId}
            sx={{ py: 2, fontSize: "1.2rem", borderRadius: 3 }}
          >
            {loading ? (
              <CircularProgress size={28} color="inherit" />
            ) : (
              "Queue ရယူမည်"
            )}
          </Button>
        </Box>
      )}

      {/* ========================================== */}
      {/* 3. Confirmation Dialog (မှားမနှိပ်မိအောင် တားပေးခြင်း) */}
      {/* ========================================== */}
      <Dialog
        open={openCancelDialog}
        onClose={() => !cancelling && setOpenCancelDialog(false)}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "error.main" }}>
          တန်းစီခြင်းကို ပယ်ဖျက်မည်လား?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ယခု ယူထားသော တန်းစီနံပါတ်ကို ပယ်ဖျက်မည်မှာ သေချာပါသလား?
            ဖျက်သိမ်းပြီးပါက ပြန်လည်ရယူ၍ မရနိုင်ပါ။
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenCancelDialog(false)}
            disabled={cancelling}
            color="inherit"
          >
            မလုပ်ပါ (Back)
          </Button>
          <Button
            onClick={handleCancelQueue}
            disabled={cancelling}
            color="error"
            variant="contained"
          >
            {cancelling ? "ဖျက်နေသည်..." : "သေချာပါသည်"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
