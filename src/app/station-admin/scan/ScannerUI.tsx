// app/station-admin/scan/ScannerUI.tsx
"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Typography,
} from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyAndCompleteQueueAction } from "./actions";

export default function ScannerUI({ stationId }: { stationId: string }) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Html5QrcodeScanner ကို တည်ဆောက်ခြင်း
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    scanner.render(
      async (decodedText) => {
        // Scan ဖတ်လို့ အောင်မြင်ရင် ကင်မရာကို ခဏပိတ်ပြီး Server Action ကို လှမ်းခေါ်ပါမယ်
        scanner.pause(true);
        setLoading(true);
        setMessage(null);

        const res = await verifyAndCompleteQueueAction(decodedText, stationId);

        if (res.error) {
          setMessage({ type: "error", text: res.error });
        } else if (res.success) {
          setMessage({ type: "success", text: res.message! });
        }

        setLoading(false);

        // ၃ စက္ကန့်ကြာရင် နောက်တစ်ယောက် ဖတ်လို့ရအောင် ကင်မရာ ပြန်ဖွင့်ပေးမယ်
        setTimeout(() => {
          setMessage(null);
          scanner.resume();
        }, 3000);
      },
      (error) => {
        // QR Code ရှာမတွေ့သေးတဲ့ အချိန်တိုင်း ဒီကိုရောက်ပါတယ်။ Error မပြဘဲ လျစ်လျူရှုထားလို့ရပါတယ်။
      },
    );

    // Component ပိတ်သွားရင် ကင်မရာကို သေချာ ပြန်ပိတ်ပေးဖို့ လိုပါတယ် (Memory Leak မဖြစ်အောင်)
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [stationId]);

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/station-admin/dashboard")}
        sx={{ mb: 2 }}
      >
        Dashboard သို့ ပြန်သွားမည်
      </Button>

      <Typography
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        gutterBottom
      >
        QR Scanner
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        textAlign="center"
        mb={3}
      >
        Customer ၏ ဖုန်းမှ QR Code အား လေးထောင့်ကွက်အတွင်း ချိန်ရွယ်ပါ။
      </Typography>

      {/* Result Messages */}
      {loading && (
        <Box display="flex" justifyContent="center" mb={2}>
          <CircularProgress />
        </Box>
      )}

      {message && (
        <Alert
          severity={message.type}
          sx={{ mb: 3, fontSize: "1.1rem", fontWeight: "bold" }}
        >
          {message.text}
        </Alert>
      )}

      {/* Scanner Box: ဒီ id="qr-reader" ဆိုတဲ့ နေရာမှာ ကင်မရာ ပွင့်လာပါလိမ့်မယ် */}
      <Card
        variant="outlined"
        sx={{ p: 1, borderRadius: 3, overflow: "hidden" }}
      >
        <div
          id="qr-reader"
          style={{ width: "100%", borderRadius: "10px" }}
        ></div>
      </Card>
    </Container>
  );
}
