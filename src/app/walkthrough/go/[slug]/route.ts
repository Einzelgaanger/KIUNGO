import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { getWalkthrough, withWalkQuery } from "@/lib/walkthroughs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const walkthrough = getWalkthrough(slug);
  const origin = new URL(request.url).origin;
  if (!walkthrough) {
    return NextResponse.redirect(new URL("/walkthrough", origin));
  }
  const first = walkthrough.steps[0];
  if (!first) {
    return NextResponse.redirect(new URL("/walkthrough", origin));
  }
  await setSessionCookie(first.personaId);
  return NextResponse.redirect(new URL(withWalkQuery(first.href, slug, 0), origin));
}
