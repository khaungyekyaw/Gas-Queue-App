// app/station-admin/dashboard/StationSettingsForm.tsx
"use client";

import LogoutButton from "@/components/LogoutButton";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { updateStationSettingsAction } from "./actions";

export default function StationSettingsForm({ station }: { station: any }) {
  const [state, formAction] = useActionState(updateStationSettingsAction, null);
  const router = useRouter();

  const isFull = station._count.queues >= station.dailyQueueLimit;

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 5 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mt={4}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {station.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {station.location}
          </Typography>
        </Box>
        <LogoutButton /> {/* <--- ဒီမှာ ထည့်ပါ */}
      </Box>
      {/* ==========================================
          SCANNER BUTTON (အရေးအကြီးဆုံး လုပ်ဆောင်ချက်)
          ========================================== */}
      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        startIcon={<QrCodeScannerIcon />}
        onClick={() => router.push("/station-admin/scan")}
        sx={{ py: 2, mb: 4, borderRadius: 3, fontSize: "1.2rem", boxShadow: 4 }}
      >
        QR Code Scan ဖတ်မည်
      </Button>

      {/* Queue Status Overview */}
      <Card
        variant="outlined"
        sx={{ mb: 4, borderRadius: 3, bgcolor: isFull ? "#fff0f0" : "#f0fdf4" }}
      >
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            ယနေ့ Queue အခြေအနေ
          </Typography>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              color={isFull ? "error" : "success.main"}
            >
              {station._count.queues}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              / {station.dailyQueueLimit}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {state?.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}
      {state?.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {state.message}
        </Alert>
      )}

      {/* ==========================================
          STATION CONTROLS FORM
          ========================================== */}
      <form action={formAction}>
        <input type="hidden" name="stationId" value={station.id} />

        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              ဆီဆိုင် ထိန်းချုပ်ရန်
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  name="isOpen"
                  defaultChecked={station.isOpen}
                  color="success"
                />
              }
              label={<strong>ဆီဆိုင် ဖွင့်ထားသည်</strong>}
              sx={{ width: "100%", mb: 1 }}
            />
            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" mb={2}>
              ရရှိနိုင်သော ဆီအမျိုးအစားများ
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch name="has92" defaultChecked={station.has92} />}
                label="92 Ron"
              />
              <FormControlLabel
                control={<Switch name="has95" defaultChecked={station.has95} />}
                label="95 Ron"
              />
              <FormControlLabel
                control={
                  <Switch name="hasDiesel" defaultChecked={station.hasDiesel} />
                }
                label="Diesel (ဒီဇယ်)"
              />
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" mb={2}>
              ယနေ့ လက်ခံမည့် Queue အရေအတွက်
            </Typography>
            <TextField
              fullWidth
              type="number"
              name="dailyQueueLimit"
              defaultValue={station.dailyQueueLimit}
              variant="outlined"
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          startIcon={<SaveIcon />}
          sx={{ py: 1.5, borderRadius: 2 }}
        >
          ပြောင်းလဲမှုများကို သိမ်းမည်
        </Button>
      </form>
    </Container>
  );
}
