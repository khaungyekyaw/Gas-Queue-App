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
  user, // <--- user data ကို လက်ခံမည်
}: {
  vehicleTypes: VehicleType[];
  user: any;
}) {
  const [state, formAction] = useActionState(addVehicleAction, null);

  // User မှာ Data အဟောင်းရှိမရှိ စစ်ဆေးခြင်း (Edit mode လား၊ Add mode လား)
  const isEditing = !!(user.plateNumber || user.fuelType);

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 4 }}>
      {/* အစ်ကိုတောင်းဆိုထားတဲ့ အရေးကြီး သတိပေးစာ (Warning Alert) */}
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <AlertTitle sx={{ fontWeight: "bold" }}>အထူးသတိပြုရန်</AlertTitle>
        လူကြီးမင်း၏ ယာဉ်အမျိုးအစားနှင့် အသုံးပြုမည့် ဆီအမျိုးအစားကို မှန်ကန်စွာ
        ရွေးချယ်ပါ။
        <strong>
          {" "}
          မှားယွင်းဖြည့်စွက်ထားပါက ဆီဆိုင်တွင် ဆီဖြည့်ခွင့် ပြုမည်မဟုတ်ပါ။
        </strong>
      </Alert>

      {/* ========================================== */}
      {/* ကန့်သတ်ချက်များ သတိပေးစာ (အသစ်ထည့်သွင်းသည်) */}
      {/* ========================================== */}
      {isEditing && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ mb: 4, borderRadius: 2, bgcolor: "#fff0f0" }}
        >
          <AlertTitle sx={{ fontWeight: "bold", color: "error.main" }}>
            ပြင်ဆင်ခြင်းဆိုင်ရာ စည်းကမ်းချက်များ
          </AlertTitle>
          <Typography variant="body2" color="error.dark" component="div">
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>
                <strong>ယာဉ်အမျိုးအစားနှင့် ဆီအမျိုးအစား</strong> ကို ၁ ရက်လျှင်
                ၁ ကြိမ်သာ ပြင်ဆင်ခွင့်ရှိပါသည်။
              </li>
              <li>
                <strong>ယာဉ်နံပါတ်</strong> ကို ၁ ပတ်လျှင် ၁ ကြိမ်သာ
                ပြင်ဆင်ခွင့်ရှိပါသည်။
              </li>
            </ul>
          </Typography>
        </Alert>
      )}

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {isEditing ? "ယာဉ်အချက်အလက် ပြင်ဆင်ရန်" : "ယာဉ်အချက်အလက် ဖြည့်သွင်းရန်"}
      </Typography>

      {state?.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {state.error}
        </Alert>
      )}

      {state?.success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {state.message}
          <Button
            color="inherit"
            size="small"
            sx={{ ml: 2, fontWeight: "bold" }}
            href="/customers"
          >
            Dashboard သို့ သွားမည်
          </Button>
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
        <RadioGroup
          name="vehicleTypeId"
          defaultValue={user.vehicleTypeId || ""} // <--- Data အဟောင်းကို အသင့်ပြထားမယ်
          row
          sx={{ mb: 3, gap: 1 }}
        >
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

        {/* ၂။ ဆီအမျိုးအစား ရွေးချယ်ခြင်း */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          ၂။ အသုံးပြုမည့် ဆီအမျိုးအစား
        </Typography>
        <RadioGroup
          name="fuelType"
          defaultValue={user.fuelType || ""} // <--- Data အဟောင်းကို အသင့်ပြထားမယ်
          row
          sx={{ mb: 3, gap: 1 }}
        >
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
          defaultValue={user.plateNumber || ""} // <--- Data အဟောင်းကို အသင့်ပြထားမယ်
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
