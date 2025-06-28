export * from "comlink";
import { wrap, expose } from "comlink";
import { Worker, parentPort, isMainThread } from "worker_threads";

type worker<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<Awaited<R>>
    : T[K];
};

export async function useWorker<T>(
  service: () => Promise<{ default: T }>
): Promise<worker<T>> {
  const servicePath = (await service())?.default;
  // @ts-ignore
  service = undefined;
  return wrap(inject(new Worker(servicePath as string))) as worker<T>;
}

export function exposeWorker<T>(service: T): T {
  if (isMainThread) {
    return resolveWorkerPath() as T;
  } else {
    expose(service, inject(parentPort));
  }
  // @ts-ignore
  service = undefined;
  return {} as T;
}

function resolveWorkerPath() {
  const err = new Error().stack?.split("\n");
  return err?.[2].match(/at (\/.*):\d+:\d+/)?.[1];
}

function inject(nep: any) {
  const listeners = new WeakMap();
  return {
    postMessage: nep.postMessage.bind(nep),
    addEventListener: (_: any, eh: any) => {
      const l = (data: any) => {
        if ("handleEvent" in eh) {
          eh.handleEvent({ data });
        } else {
          eh({ data });
        }
      };
      nep.on("message", l);
      listeners.set(eh, l);
    },
    removeEventListener: (_: any, eh: any) => {
      const l = listeners.get(eh);
      if (!l) {
        return;
      }
      nep.off("message", l);
      listeners.delete(eh);
    },
    start: nep.start && nep.start.bind(nep),
  };
}
