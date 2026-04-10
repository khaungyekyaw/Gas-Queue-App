// app/station-admin/scan/page.tsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ScannerUI from "./ScannerUI";

export default async function ScanPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) redirect("/login");

  const admin = await prisma.user.findUnique({
    where: { id: userId },
    select: { stationId: true },
  });

  if (!admin?.stationId) redirect("/station-admin/dashboard");

  return (
    <main>
      <ScannerUI stationId={admin.stationId} />
    </main>
  );
}
