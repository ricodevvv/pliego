import { NextResponse, type NextRequest } from "next/server";
import { LOCALES } from "@/lib/i18n";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))) return;
  const language = request.headers.get("accept-language") ?? "";
  const locale = /^\s*es\b/i.test(language) ? "es" : "en";
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
