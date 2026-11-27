import type { Metadata } from "next";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";

export const metadata: Metadata = {
  title: "Süperadmin Yönetim ve Kontrol Merkezi",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <RoleDashboard locale={locale || "tr"} role="ADMIN" />;
}
