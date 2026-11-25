import { notFound } from "next/navigation";
import { GoogleRoleAuth } from "@/components/auth/GoogleRoleAuth";
import { normalizeLocale } from "@/lib/i18n/dictionary";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const [{ locale: rawLocale }, query] = await Promise.all([params, searchParams]);
  if (rawLocale !== "tr" && rawLocale !== "en") notFound();

  return (
    <main className="min-h-[75vh] bg-slate-50 px-4 py-12 sm:py-16">
      <GoogleRoleAuth
        locale={normalizeLocale(rawLocale)}
        mode="register"
        initialRole={query.role === "CREATOR" ? "CREATOR" : "ADVERTISER"}
      />
    </main>
  );
}
