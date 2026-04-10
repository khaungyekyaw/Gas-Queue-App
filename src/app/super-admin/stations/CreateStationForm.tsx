// app/super-admin/stations/CreateStationForm.tsx
"use client";

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import {
  Alert,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import { useFormState } from "react-dom";
import { createStationAction } from "./actions";

export default function CreateStationForm() {
  const [state, formAction] = useFormState(createStationAction, null);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          mb={3}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <AddBusinessIcon color="primary" /> ဆီဆိုင်အသစ် ဖန်တီးရန်
        </Typography>

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

        <form action={formAction}>
          <TextField
            fullWidth
            label="ဆီဆိုင်အမည်"
            name="name"
            placeholder="ဥပမာ - မြတ်မေတ္တာမွန် (၁)"
            variant="outlined"
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="တည်နေရာ (လိပ်စာ)"
            name="location"
            placeholder="ဥပမာ - ထားဝယ်မြို့၊ အိမ်ရှေ့ပြင်ရပ်ကွက်"
            variant="outlined"
            multiline
            rows={2}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="တစ်နေ့တာ လက်ခံမည့် Queue အရေအတွက်"
            name="dailyQueueLimit"
            type="number"
            defaultValue={100}
            variant="outlined"
            required
            sx={{ mb: 4 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, borderRadius: 2, fontSize: "1.1rem" }}
          >
            သိမ်းဆည်းမည်
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
