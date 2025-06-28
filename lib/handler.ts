type RemoveFirstArg<T> = T extends (arg1: any, ...rest: infer A) => infer R
  ? (...args: A) => Promise<{
      ok: boolean;
      status: number;
      statusText: string;
      error?: Error;
      data: R;
    }>
  : never;

type Handler<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? RemoveFirstArg<T[K]>
    : never;
};

export function exposeHandler<T extends new (...args: any[]) => any>(
  targetClass: T
): Handler<InstanceType<T>> {
  const instance = new targetClass() as any;
  const route = instance.constructor[IdRoute];
  const proxy: any = { [IdRoute]: route };
  {
    const client = isBrowser();

    const proto = Object.getPrototypeOf(instance);
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === "constructor") continue;

      const action =
        "x_" + key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

      if (client) {
        proxy[key] = sendRequest.bind(
          sendRequest,
          instance[key][IdRoute] ?? "GET",
          `${route}?${action}`
        );
      } else {
        proxy[action] = instance[key];
      }
    }
  }

  return proxy as Handler<InstanceType<T>>;
}

// server: initialize handler on API Request
export function initHandler(handlers: ReturnType<typeof exposeHandler>[]) {
  // create pattern
  {
    const { parse } = require("regexparam");
    for (const i in handlers) {
      (handlers[i] as any)[IdMatch] = parse((handlers[i] as any)[IdRoute]);
    }
    handlers.sort((a: any, b: any) => {
      const keyA = a[IdRoute].includes(":");
      const keyB = b[IdRoute].includes(":");

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
      if (target[IdMatch].pattern?.test(url.pathname)) {
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

              console.log(`\n ❗Error in { ${target[IdRoute]} -> ${j} }\n`);
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

function isBrowser() {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
}

const IdRoute = Symbol.for("route");
const IdMethod = Symbol.for("method");
const IdMatch = Symbol.for("match");

export function route(path: string): ClassDecorator {
  return function (target: any) {
    target[IdRoute] = path;
  };
}

export const get = method("GET");
export const post = method("POST");
export const put = method("PUT");
export const patch = method("PATCH");
export const deleté = method("DELETE");

//

function method(name: string) {
  return function (): MethodDecorator {
    return function (target, propertyKey, descriptor: PropertyDescriptor) {
      descriptor.value![IdMethod] = name;
    };
  };
}

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
