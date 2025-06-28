import { exposeWorker } from "@/lib/adaptor";
import { decode, encode } from "@msgpack/msgpack";

export default exposeWorker(
  class {
    async greet(name: string) {
      return `Hello, ${name}!`;
    }
    async run(port2: MessagePort) {
      // const port = (await cb()) as MessagePort;
      port2.addEventListener("message", (e) => {
        console.log("Receive in Worker: ", e.data);
      });
      port2.start();

      port2.postMessage("Razif");
      // return "Run " + (await cb());
      return "";
    }

    process(buffer: any) {
      const input = decode(buffer) as any;
      return encode({ ...input, processed: true });
    }
  }
);
