// middleware.ts
import { Keys, RoutePath } from "@/lib/constant";
import { isRoute, toRoute } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
// import { verifyToken } from "./utils/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // const isLoggedIn = !!(token && verifyToken(token));
  const isLoggedIn = true;

  if (isRoute(req, RoutePath.SignIn) && isLoggedIn) {
    return toRoute(req, RoutePath.Home);
  }

  // if (!isRoute(req, RoutePath.SignIn) && !isLoggedIn) {
  //   return toRoute(req, RoutePath.SignIn);
  // }

  const res = NextResponse.next();

  if (isLoggedIn) {
    res.headers.set(Keys.authStatus, "1");
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next|favicon\\.ico|.*\\.(?:jpg|jpeg|png|svg|webp|css|js|ico|woff2?|ttf)).*)",
  ],
};
