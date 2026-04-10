// app/(customer)/add-vehicle/AddVehicleForm.tsx
"use client";

import {
  Alert,
  AlertTitle,
  Button,
  Card,
  CardActionArea,
  Container,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useActionState } from "react";
import { addVehicleAction } from "./actions";

interface VehicleType {
  id: string;
  name: string;
}

export default function AddVehicleForm({
  vehicleTypes,
}: {
  vehicleTypes: VehicleType[];
}) {
  const [state, formAction] = useActionState(addVehicleAction, null);

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
      {/* အစ်ကိုတောင်းဆိုထားတဲ့ အရေးကြီး သတိပေးစာ (Warning Alert) */}
      <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: "bold" }}>အထူးသတိပြုရန်</AlertTitle>
        လူကြီးမင်း၏ ယာဉ်အမျိုးအစားနှင့် အသုံးပြုမည့် ဆီအမျိုးအစားကို မှန်ကန်စွာ
        ရွေးချယ်ပါ။
        <strong>
          {" "}
          မှားယွင်းဖြည့်စွက်ထားပါက ဆီဆိုင်တွင် ဆီဖြည့်ခွင့် ပြုမည်မဟုတ်ပါ။
        </strong>
      </Alert>

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        ယာဉ်အချက်အလက် ဖြည့်သွင်းရန်
      </Typography>

      {state?.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      <form action={formAction}>
        {/* ၁။ ယာဉ်အမျိုးအစား ရွေးချယ်ခြင်း */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          ၁။ ယာဉ်အမျိုးအစား
        </Typography>
        <RadioGroup name="vehicleTypeId" row sx={{ mb: 3, gap: 1 }}>
          {vehicleTypes.map((type) => (
            <Card
              key={type.id}
              variant="outlined"
              sx={{ flex: 1, borderRadius: 2 }}
            >
              <CardActionArea>
                <FormControlLabel
                  value={type.id}
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2" fontWeight="medium">
                      {type.name}
                    </Typography>
                  }
                  sx={{ width: "100%", m: 0, p: 1.5, justifyContent: "center" }}
                />
              </CardActionArea>
            </Card>
          ))}
        </RadioGroup>

        {/* ၂။ ဆီအမျိုးအစား ရွေးချယ်ခြင်း (အသစ်ထပ်ထည့်ထားသောအပိုင်း) */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          ၂။ အသုံးပြုမည့် ဆီအမျိုးအစား
        </Typography>
        <RadioGroup name="fuelType" row sx={{ mb: 3, gap: 1 }}>
          {[
            { value: "OCTANE_92", label: "92 Ron" },
            { value: "OCTANE_95", label: "95 Ron" },
            { value: "DIESEL", label: "ဒီဇယ် (Diesel)" },
          ].map((fuel) => (
            <Card
              key={fuel.value}
              variant="outlined"
              sx={{ flex: 1, borderRadius: 2 }}
            >
              <CardActionArea>
                <FormControlLabel
                  value={fuel.value}
                  control={<Radio size="small" color="secondary" />}
                  label={
                    <Typography variant="body2" fontWeight="medium">
                      {fuel.label}
                    </Typography>
                  }
                  sx={{ width: "100%", m: 0, p: 1.5, justifyContent: "center" }}
                />
              </CardActionArea>
            </Card>
          ))}
        </RadioGroup>

        {/* ၃။ ယာဉ်နံပါတ် */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          ၃။ ယာဉ်နံပါတ် (ဥပမာ - 1M 1234)
        </Typography>
        <TextField
          fullWidth
          name="plateNumber"
          variant="outlined"
          sx={{ mb: 4 }}
          InputProps={{ sx: { borderRadius: 2, bgcolor: "background.paper" } }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ py: 1.8, fontSize: "1.1rem", borderRadius: 3, boxShadow: 3 }}
        >
          အချက်အလက်များကို သိမ်းဆည်းမည်
        </Button>
      </form>
    </Container>
  );
}
