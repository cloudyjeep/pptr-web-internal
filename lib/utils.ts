import { clsx, type ClassValue } from "clsx";
import { NextRequest, NextResponse } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toRoute(req: NextRequest, routePath: string) {
  return NextResponse.redirect(new URL(routePath, req.url));
}

export function isRoute(req: NextRequest, routePath: string) {
  const { pathname } = req.nextUrl;
  return pathname === routePath || pathname.startsWith(routePath + "/");
}
