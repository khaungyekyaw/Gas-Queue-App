// components/LogoutButton.tsx
"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import { Button } from "@mui/material";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    // NextAuth ရဲ့ signOut ကိုခေါ်ပြီး၊ ထွက်ပြီးတာနဲ့ /login ကို တန်းပို့ပေးပါမယ်
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button
      variant="outlined"
      color="error"
      size="small"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
      sx={{ borderRadius: 2, fontWeight: "bold" }}
    >
      ထွက်မည် (Logout)
    </Button>
  );
}
