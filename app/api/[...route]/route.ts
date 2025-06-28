import { initHandler } from "@/lib/handler";
import { UserHandler } from "@/api/handler/user";

const handler = initHandler([
  // Register Handler here
  UserHandler,
]);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

export const runtime = "nodejs"; // for read body -> req.json()
