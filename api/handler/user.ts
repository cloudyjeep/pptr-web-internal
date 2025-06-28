import { exposeHandler, deleté, get, route, post } from "@/lib/handler";

@route("/api/user")
class handler {
  hello(req: Request, text: string) {
    return { hello: text + " " + text };
  }

  @post()
  createUser(req: Request, user: { name: string; age: number }, count: number) {
    return {
      message: "behasil tambah user",
      user,
      count,
    };
  }

  getUser(req: Request, id: string) {
    console.log("Hello " + id);
  }

  setUser(req: Request, text: string) {
    console.log("Hello " + text);
  }

  deleteUser(req: Request, text: string) {
    console.log("Hello " + text);
  }
}

export const UserHandler = exposeHandler(handler);
