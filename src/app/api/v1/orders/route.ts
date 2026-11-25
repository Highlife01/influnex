import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/data/marketplaceStore";
import { OrderStateMachineEngine } from "@/lib/orders/stateMachine";
import { OrderCreateInputSchema } from "@/lib/validators/schemas";

export const globalOrderEngine = new OrderStateMachineEngine();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = OrderCreateInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (parsed.data.sourceType === "DIRECT_SERVICE") {
      if (!parsed.data.serviceId) {
        return NextResponse.json(
          { error: "SERVICE_ID_REQUIRED" },
          { status: 400 }
        );
      }
      const service = marketplaceStore.getServiceById(parsed.data.serviceId);
      if (!service || !service.isActive) {
        return NextResponse.json(
          { error: "SERVICE_NOT_FOUND_OR_INACTIVE" },
          { status: 404 }
        );
      }

      const order = globalOrderEngine.createOrder({
        sourceType: "DIRECT_SERVICE",
        advertiserId: parsed.data.advertiserId,
        advertiserBrandName: parsed.data.advertiserBrandName,
        creatorId: service.creatorId,
        creatorUsername: service.creatorUsername,
        serviceId: service.id,
        serviceTitle: service.titleTr,
        platform: service.platform,
        grossAmountMinorUnits: service.priceMinorUnits,
        deliveryDays: service.deliveryDays,
        maxRevisions: service.revisionCount,
        usageRights: service.usageRightsTr,
        paidAdsReuseAllowed: service.paidAdsReuseAllowed,
        acceptedTermsVersion: parsed.data.acceptedTermsVersion,
      });

      return NextResponse.json(order, { status: 201 });
    }

    return NextResponse.json(
      { error: "UNSUPPORTED_ORDER_SOURCE" },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ORDER_CREATE_ERROR" },
      { status: 400 }
    );
  }
}
