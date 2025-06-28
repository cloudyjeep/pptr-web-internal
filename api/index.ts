import { useWorker, proxy, transfer } from "@/lib/adaptor";
import { encode, decode } from "@msgpack/msgpack";

const api = await useWorker(() => import("@/api/service/user"));

const user = {
  hello(text: string) {
    console.log("Hello " + text);
  },
};


// const enpoint = await useEndpoint(() => import("@/api/service/user"))

// const input = { hello: "world" };
// const encoded = encode(input);
// console.log("main", { encoded });

// const resultBuffer = await api.process(encoded);
// console.log("main", { resultBuffer });

// const result = decode(resultBuffer as any);
// console.log("main", { result });

// async function main() {
//   const start = Date.now();
//   //   for (let i = 0; i < 1000; i++) {
//   //     await api.greet("Razif " + (i + 1));
//   //     await api.run(func(() => "Jefri"));
//   //   }

//   let i = 1;
//   while (Date.now() - start < 1000) {
//     // await api.greet("Razif " + i++);
//     // await api.run(proxy(() => "Jefri " + i++));
//     const result = await api.process(encode({ result: i++ }));
//     decode(result);
//   }

//   console.log(`est: ${Date.now() - start} ms`);
//   console.log(`call: ${i} / second`);

//   //   console.log(await api.greet("Razif"));
//   //   const { port1, port2 } = new MessageChannel();
//   //   //   port1.onmessage = (e) => {
//   //   //     console.log("Receive: ", e.data);
//   //   //   };
//   //   port1.addEventListener("message", (e) => {
//   //     console.log("Receive: ", [e.currentTarget]);
//   //   });
//   //   port1.start();
//   //   port1.postMessage("Jefri");

//   //   await api.run(transfer(port2, [port2]));

//   //   console.log(await api.run(proxy(() => "Jefri")));
// }

// main();
