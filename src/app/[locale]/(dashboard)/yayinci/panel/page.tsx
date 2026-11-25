import { notFound } from "next/navigation";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";

export default async function CreatorDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "tr" && locale !== "en") notFound();
  return <RoleDashboard locale={locale} role="CREATOR" />;
}
