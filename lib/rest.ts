type Tail<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never;

type Handlers<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? (...args: Tail<Parameters<T[K]>>) => Promise<ReturnFn<T[K]>>
    : never;
};

type Handler<R> = (req: Request, ...args: any[]) => R;

type ReturnFn<F> = F extends (...args: any[]) => infer R
  ? { ok: boolean; status: number; statusText: string; error?: Error; data: R }
  : never;

// key symbol
const path = Symbol("path");
const pattern = Symbol("pattern");
const method = Symbol("method");

// creator method for handler
export const GET = request("GET");
export const POST = request("POST");
export const PUT = request("PUT");
export const PATCH = request("PATCH");
export const DELETE = request("DELETE");

// server: creator handlers for handling API request
export function exposeHandler<
  T extends Record<string, (...args: any[]) => any>
>(route: string, handler: T): Handlers<T> {
  const result: any = { [path]: route };
  {
    const client = isBrowser();
    for (const key in handler) {
      const action =
        "x_" + key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
      if (client) {
        result[key] = sendRequest.bind(
          sendRequest,
          (handler[key] as any)[method] ?? "GET",
          `${route}?${action}`
        );
      } else {
        result[action] = handler[key];
      }
    }
    (handler as any) = null;
  }
  return result as Handlers<T>;
}

// server: initialize handler on API Request
export function initHandler(handlers: ReturnType<typeof exposeHandler>[]) {
  // create pattern
  {
    const { parse } = require("regexparam");
    for (const i in handlers) {
      (handlers[i] as any)[pattern] = parse((handlers[i] as any)[path]);
    }
    handlers.sort((a: any, b: any) => {
      const keyA = a[path].includes(":");
      const keyB = b[path].includes(":");

      if (keyA && !keyB) return 1;
      if (!keyA && keyB) return -1;

      return a.localeCompare(b);
    });
  }

  return async function (req: Request) {
    let url = new URL(req.url);
    let errors: any = {
      error: "Route not found",
      path: url.pathname,
      method: req.method,
    };

    for (let i = 0; i < handlers.length; i++) {
      const target = handlers[i] as any;
      if (target[pattern].pattern?.test(url.pathname)) {
        for (const j in target) {
          if (url.searchParams.has(j)) {
            try {
              let payload = await readPayload(req, url);
              const result = await target[j](req, ...payload);

              // cleaning
              (req as any) = null;
              (url as any) = null;
              (payload as any) = null;
              errors = null;

              return Response.json(result ?? null);
            } catch (err) {
              errors.action = j;
              errors.error = `Internal Server Error`;
              errors.message = String(err);

              console.log(`\n ❗Error in { ${target[path]} -> ${j} }\n`);
              console.error(err);
            }
            break;
          }
        }
      }
    }

    const responseError = Response.json(errors, {
      status: errors.action ? 500 : 404,
    });

    // cleaning
    (req as any) = null;
    (url as any) = null;
    errors = null;

    return responseError;
  };
}

// Helper Function

// check is on browser side
function isBrowser() {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
}

// wrapper creator handler
function request(reqMethod: string) {
  return function <R>(handler: Handler<R>): Handler<R> {
    (handler as any)[method] = reqMethod;
    return handler as Handler<R>;
  };
}

// server: read body to json
export async function readPayload(req: Request, url: URL) {
  let json = [];

  if (req.method === "GET") {
    const size = url.searchParams.size - 1;
    for (let i = 0; i < size; i++) {
      const raw = url.searchParams.get(String(i));
      try {
        const parse = JSON.parse(raw as string);
        json.push(parse);
      } catch (err) {
        json.push(raw);
      }
    }
  } else if (req.body) {
    try {
      json = await req.json();
    } catch (e) {}
  }

  return json;
}

// client: send request to server API
async function sendRequest(method: string, url: string, ...body: any[]) {
  let options: RequestInit = { method };

  if (method !== "GET") {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  } else if (body?.length) {
    const params = new URLSearchParams();
    for (let i = 0; i < body.length; i++) {
      if (typeof body[i] == "string") {
        params.append(String(i), body[i]);
      } else {
        params.append(String(i), JSON.stringify(body[i]));
      }
    }
    url += `&${params.toString()}`;
  }

  (body as any) = null; // cleaning

  let res = await fetch(url, options);
  const payload: any = {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
  };

  try {
    const key = res.ok ? "data" : "errors";
    payload[key] = await res.json();
  } catch (error) {
    payload.errors = error;
  }

  // cleaning
  (options as any) = null;
  (res as any) = null;

  return payload;
}
