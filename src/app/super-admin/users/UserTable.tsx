// app/super-admin/users/UserTable.tsx
"use client";

import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Snackbar,
  Tab, // <-- Tabs နဲ့ Tab ကို အသစ်ထည့်ထားပါတယ်
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toggleUserArchiveStatus } from "./actions";

export default function UserTable({ users }: { users: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ==========================================
  // Filter လုပ်ရန်အတွက် Tab State (အသစ်ထပ်ထည့်ထားသောအပိုင်း)
  // ==========================================
  const [tabValue, setTabValue] = useState(0); // 0 = အားလုံး, 1 = Admins, 2 = Customers

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setLoadingId(userId);
    const res = await toggleUserArchiveStatus(userId, currentStatus);

    if (res.error) setMessage({ type: "error", text: res.error });
    if (res.success) setMessage({ type: "success", text: res.message! });

    setLoadingId(null);
  };

  // ==========================================
  // လက်ရှိ ရွေးချယ်ထားသော Tab ပေါ်မူတည်၍ Data များကို စစ်ထုတ်ခြင်း
  // ==========================================
  const filteredUsers = users.filter((user) => {
    if (tabValue === 0) return true; // အားလုံး
    if (tabValue === 1)
      return user.role === "SUPER_ADMIN" || user.role === "STATION_ADMIN"; // ဝန်ထမ်းများသာ
    if (tabValue === 2) return user.role === "CUSTOMER"; // သုံးစွဲသူများသာ
    return true;
  });

  return (
    <Box>
      <Snackbar
        open={!!message}
        autoHideDuration={4000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={message?.type} variant="filled">
          {message?.text}
        </Alert>
      </Snackbar>

      {/* ========================================== */}
      {/* Filter Tabs UI (အသစ်ထပ်ထည့်ထားသောအပိုင်း) */}
      {/* ========================================== */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="အားလုံး" sx={{ fontWeight: "bold" }} />
          <Tab label="ဝန်ထမ်းများ (Admins)" sx={{ fontWeight: "bold" }} />
          <Tab label="သုံးစွဲသူများ (Customers)" sx={{ fontWeight: "bold" }} />
        </Tabs>
      </Box>

      <TableContainer
        component={Card}
        variant="outlined"
        sx={{ borderRadius: 3, boxShadow: 2 }}
      >
        <Table sx={{ minWidth: 600 }} aria-label="user table">
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell>
                <strong>အမည် / Email</strong>
              </TableCell>
              <TableCell>
                <strong>ဖုန်းနံပါတ် / ယာဉ်နံပါတ်</strong>
              </TableCell>
              <TableCell>
                <strong>Role (ရာထူး)</strong>
              </TableCell>
              <TableCell>
                <strong>အခြေအနေ</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* အရင်က users.map ဖြစ်နေတာကို filteredUsers.map လို့ ပြောင်းလိုက်ပါတယ် */}
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {/* 1. Name & Email */}
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {user.name || "အမည်မသိ"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email || "Email မရှိပါ"}
                  </Typography>
                </TableCell>

                {/* 2. Phone & Plate Number */}
                <TableCell>
                  <Typography variant="body2">{user.phoneNo || "-"}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.plateNumber ? `ယာဉ်: ${user.plateNumber}` : ""}
                  </Typography>
                </TableCell>

                {/* 3. Role */}
                <TableCell>
                  <Chip
                    label={user.role}
                    color={
                      user.role === "SUPER_ADMIN"
                        ? "error"
                        : user.role === "STATION_ADMIN"
                          ? "primary"
                          : "default"
                    }
                    size="small"
                  />
                  {user.station && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                      mt={0.5}
                    >
                      {user.station.name}
                    </Typography>
                  )}
                </TableCell>

                {/* 4. Status */}
                <TableCell>
                  <Chip
                    label={user.isArchived ? "Banned" : "Active"}
                    color={user.isArchived ? "error" : "success"}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                {/* 5. Actions (Ban / Unban) */}
                <TableCell align="right">
                  {user.role !== "SUPER_ADMIN" && (
                    <Button
                      variant={user.isArchived ? "contained" : "outlined"}
                      color={user.isArchived ? "success" : "error"}
                      size="small"
                      startIcon={
                        user.isArchived ? (
                          <CheckCircleOutlineIcon />
                        ) : (
                          <BlockIcon />
                        )
                      }
                      onClick={() => handleToggle(user.id, user.isArchived)}
                      disabled={loadingId === user.id}
                      sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                      {loadingId === user.id
                        ? "Processing..."
                        : user.isArchived
                          ? "Unban (ပြန်ဖွင့်မည်)"
                          : "Ban (အကောင့်ပိတ်မည်)"}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {/* အရင်က users.length ဖြစ်နေတာကို filteredUsers.length လို့ ပြောင်းလိုက်ပါတယ် */}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    ရွေးချယ်ထားသော စာရင်းတွင် User တစ်ဦးမျှ မရှိသေးပါ။
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
