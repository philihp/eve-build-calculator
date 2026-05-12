import { NextResponse } from "next/server";
import { BLUEPRINT_BY_TYPE_ID, SHIP_BLUEPRINTS } from "./data";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return SHIP_BLUEPRINTS.map((b) => ({ typeID: String(b.typeID) }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ typeID: string }> },
) {
  const { typeID } = await ctx.params;
  const id = Number(typeID);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid typeID" }, { status: 400 });
  }
  const entry = BLUEPRINT_BY_TYPE_ID[id];
  if (!entry) {
    return NextResponse.json(
      { error: "ship hull not found", typeID: id },
      { status: 404 },
    );
  }
  return NextResponse.json(entry.blueprint);
}
