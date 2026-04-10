// app/super-admin/dashboard/CreateAdminForm.tsx
"use client";

import {
  Alert,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useActionState } from "react";
import { createStationAdminAction } from "./actions";

export default function CreateAdminForm({ stations }: { stations: any[] }) {
  const [state, formAction] = useActionState(createStationAdminAction, null);

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Station Admin အသစ်ဖန်တီးရန်
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
            label="ဖုန်းနံပါတ်"
            name="phoneNo"
            variant="outlined"
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="စကားဝှက်"
            name="password"
            type="password"
            variant="outlined"
            required
            sx={{ mb: 3 }}
          />

          <TextField
            select
            fullWidth
            label="တာဝန်ကျမည့် ဆီဆိုင်"
            name="stationId"
            defaultValue=""
            required
            sx={{ mb: 4 }}
          >
            {stations.map((station) => (
              <MenuItem key={station.id} value={station.id}>
                {station.name} ({station.location})
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ py: 1.5, borderRadius: 2 }}
          >
            အကောင့် ဖန်တီးမည်
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
