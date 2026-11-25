import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/data/marketplaceStore";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const resolved = marketplaceStore.resolveCreatorByUsername(id);

  if (resolved.type === "FOUND") {
    const services = marketplaceStore.getCreatorServices(resolved.profile.id);
    return NextResponse.json({
      tenantId: "influnex",
      profile: resolved.profile,
      services,
    });
  }

  if (resolved.type === "REDIRECT_301") {
    return NextResponse.json(
      {
        redirect: true,
        status: 301,
        destinationUsername: resolved.destinationUsername,
      },
      { status: 301 }
    );
  }

  return NextResponse.json({ error: "CREATOR_NOT_FOUND" }, { status: 404 });
}
