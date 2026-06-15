import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to") ?? "/admin";
  const disable = url.searchParams.get("disable") === "1";

  const response = NextResponse.redirect(new URL(to, request.url));

  if (disable) {
    response.cookies.set("hotmess_demo_admin", "", { maxAge: 0, path: "/" });
  } else {
    response.cookies.set("hotmess_demo_admin", "1", {
      maxAge: 60 * 60 * 24 * 7, // 7 Tage
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
  }

  return response;
}
