import { NextResponse } from "next/server";
import { globalOrderEngine } from "../route";
import { OrderStateTransitionInputSchema } from "@/lib/validators/schemas";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const actorId = req.headers.get("x-actor-uid") || "";
  const actorRole = req.headers.get("x-actor-role") || "";

  const order = globalOrderEngine.getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
  }

  if (
    actorRole !== "ADMIN" &&
    actorId !== order.advertiserId &&
    actorId !== order.creatorId
  ) {
    return NextResponse.json(
      { error: "IDOR_FORBIDDEN_ORDER_ACCESS" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    order,
    events: globalOrderEngine.getOrderEvents(id),
    ledgerEntries:
      actorRole === "ADMIN"
        ? globalOrderEngine.ledger.getEntriesForOrder(id)
        : undefined,
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = OrderStateTransitionInputSchema.safeParse({
      ...body,
      orderId: id,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const updated = globalOrderEngine.transition(parsed.data);
    return NextResponse.json({
      order: updated,
      events: globalOrderEngine.getOrderEvents(id),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "TRANSITION_ERROR";
    const status = msg.includes("IDOR") || msg.includes("UNAUTHORIZED") ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
