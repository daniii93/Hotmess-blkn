import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const isLocalPreview = ["localhost", "127.0.0.1", "0.0.0.0"].includes(request.nextUrl.hostname);
  const target = isLocalPreview
    ? new URL("/admin", "http://127.0.0.1:3000")
    : new URL("/", request.url);
  const response = NextResponse.redirect(target);

  if (isLocalPreview) {
    response.cookies.set("hotmess_demo_admin", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }

  return response;
}
