import { NextResponse } from "next/server";
import { z } from "zod";
import {
  FirebaseAdminConfigurationError,
  getInfluNexAdminServices,
} from "@/lib/firebase/admin";
import { resolveAccountRole } from "@/lib/auth/roles";

export const runtime = "nodejs";

const profileSchema = z.object({
  role: z.enum(["ADVERTISER", "CREATOR"]),
});

const SUPERADMIN_EMAIL = (
  process.env.SUPERADMIN_EMAIL || "cebrailkara@gmail.com"
).trim().toLowerCase();

function dashboardPath(locale: string, role: string): string {
  if (role === "ADMIN") return `/${locale}/yonetim`;
  if (role === "CREATOR") return `/${locale}/yayinci/panel`;
  return `/${locale}/reklamveren/panel`;
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const idToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const parsedBody = profileSchema.safeParse(await request.json().catch(() => null));

  if (!idToken || !parsedBody.success) {
    return NextResponse.json(
      { error: "Geçerli Google oturumu ve hesap türü gerekli." },
      { status: 400 },
    );
  }

  let services: ReturnType<typeof getInfluNexAdminServices>;
  try {
    services = getInfluNexAdminServices();
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return NextResponse.json(
        {
          error:
            "Google girişi için sunucu Firebase Admin kimlik bilgileri yapılandırılmamış.",
        },
        { status: 503 },
      );
    }
    console.error("[AUTH_ADMIN_INIT_FAILED]", error);
    return NextResponse.json(
      { error: "Kimlik doğrulama servisi şu anda kullanılamıyor." },
      { status: 500 },
    );
  }

  let decodedToken;
  try {
    decodedToken = await services.auth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json(
      { error: "Google oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın." },
      { status: 401 },
    );
  }

  const email = decodedToken.email?.trim().toLowerCase();
  if (!email || decodedToken.email_verified !== true) {
    return NextResponse.json(
      { error: "Doğrulanmış bir Google e-posta adresiyle giriş yapın." },
      { status: 403 },
    );
  }

  try {
    const userRef = services.firestore
      .collection("influnex_users")
      .doc(decodedToken.uid);
    const userSnapshot = await userRef.get();
    const storedRole = userSnapshot.get("role");
    const role = resolveAccountRole({
      email,
      superAdminEmail: SUPERADMIN_EMAIL,
      storedRole,
      requestedRole: parsedBody.data.role,
    });
    const isSuperAdmin = role === "ADMIN";
    const now = new Date().toISOString();
    const existingUser = await services.auth.getUser(decodedToken.uid);

    await services.auth.setCustomUserClaims(decodedToken.uid, {
      ...existingUser.customClaims,
      role,
      admin: isSuperAdmin,
    });

    await userRef.set(
      {
        uid: decodedToken.uid,
        tenantId: "influnex",
        role,
        email,
        displayName: decodedToken.name || "",
        photoURL: decodedToken.picture || "",
        ...(userSnapshot.exists ? {} : { createdAt: now }),
        updatedAt: now,
      },
      { merge: true },
    );

    return NextResponse.json({
      role,
      dashboardPath: dashboardPath(
        request.headers.get("x-influnex-locale") === "en" ? "en" : "tr",
        role,
      ),
    });
  } catch (error) {
    console.error("[AUTH_PROFILE_SYNC_FAILED]", error);
    return NextResponse.json(
      { error: "Hesap rolünüz kaydedilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
