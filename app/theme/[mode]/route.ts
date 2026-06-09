import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ mode: string }> },
) {
  const { mode } = await params;
  const jar = await cookies();
  const current = jar.get("theme")?.value;
  if ((mode === "light" || mode === "dark") && current !== mode) {
    jar.set("theme", mode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  } else {
    jar.delete("theme");
  }
  return NextResponse.redirect(new URL("/", _req.url));
}
