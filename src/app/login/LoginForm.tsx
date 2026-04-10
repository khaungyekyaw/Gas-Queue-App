// app/login/LoginForm.tsx
"use client";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Icon အသစ်
import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginForm({
  isCustomerDefault,
}: {
  isCustomerDefault?: boolean;
}) {
  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // ==========================================
  // UI မှာ Admin Form ပြမလား၊ Google Button ပြမလား ထိန်းချုပ်မည့် State
  // isCustomerDefault အပေါ်မူတည်ပြီး အလိုလို ရွေးချယ်ပေးပါမယ်
  // ==========================================
  const [showAdmin, setShowAdmin] = useState(!isCustomerDefault);

  // ၁။ Customer Google Login
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    // Ep 33: NextAuth ရဲ့ signIn ကို သုံးပြီး Google ဘက်ကို လွှဲပေးတာပါ
    await signIn("google", { callbackUrl: "/customers/" });
  };

  // ၂။ Admin Credentials Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAdmin(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      phoneNo,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoadingAdmin(false);
    } else {
      // အောင်မြင်ရင် page ကို refresh လုပ်လိုက်မယ်၊ page.tsx ကနေ role အလိုက် auto redirect လုပ်သွားမယ်
      window.location.reload();
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        pt: 8,
        pb: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* App Logo or Name */}
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        Fuel Queue
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={5}>
        ထားဝယ် ဆီဆိုင် တန်းစီစနစ်မှ ကြိုဆိုပါသည်
      </Typography>

      {!showAdmin ? (
        // ==========================================
        // Customer ဝင်လာလျှင် ပြမည့် UI (Google Only)
        // ==========================================
        <>
          <Card
            variant="outlined"
            sx={{
              width: "100%",
              p: 3,
              borderRadius: 3,
              mb: 4,
              textAlign: "center",
              boxShadow: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              အသုံးပြုသူများအတွက် (Customers)
            </Typography>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={
                loadingGoogle ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <GoogleIcon />
                )
              }
              onClick={handleGoogleLogin}
              disabled={loadingGoogle}
              sx={{
                py: 1.5,
                borderRadius: 2,
                bgcolor: "#DB4437",
                "&:hover": { bgcolor: "#C13528" },
              }}
            >
              Google အကောင့်ဖြင့် ဝင်မည်
            </Button>
          </Card>

          <Divider sx={{ width: "100%", mb: 4 }}>
            <Typography variant="caption" color="text.secondary">
              သို့မဟုတ်
            </Typography>
          </Divider>

          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            size="large"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => setShowAdmin(true)} // လိုအပ်ရင် Admin ဘက် ကူးလို့ရအောင်
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            ဝန်ထမ်း ဝင်ပေါက်သို့ သွားမည်
          </Button>
        </>
      ) : (
        // ==========================================
        // Admin ဝင်လာလျှင် ပြမည့် UI (Text Fields)
        // ==========================================
        <>
          <Card
            variant="outlined"
            sx={{
              width: "100%",
              p: 3,
              borderRadius: 3,
              mb: 4,
              textAlign: "center",
              boxShadow: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              ဝန်ထမ်း အကောင့်ဖြင့် ဝင်မည်
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleAdminLogin}
              sx={{ width: "100%" }}
            >
              <TextField
                fullWidth
                label="ဖုန်းနံပါတ်"
                variant="outlined"
                margin="normal"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="စကားဝှက်"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                fullWidth
                size="large"
                startIcon={
                  loadingAdmin ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AdminPanelSettingsIcon />
                  )
                }
                disabled={loadingAdmin}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                {loadingAdmin ? "စစ်ဆေးနေပါသည်..." : "ဝင်မည်"}
              </Button>
            </Box>
          </Card>

          <Button
            variant="text"
            color="inherit"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={() => setShowAdmin(false)} // Customer ဘက် ပြန်ကူးလို့ရအောင်
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            Customer ဝင်ပေါက်သို့ ပြန်သွားမည်
          </Button>
        </>
      )}
    </Container>
  );
}
