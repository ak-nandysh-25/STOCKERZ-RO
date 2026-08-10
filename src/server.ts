import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";

// Global fallback for createMiddleware to prevent circular chunk splitting failures during SSR
if (typeof (globalThis as any).createMiddleware === "undefined") {
  (globalThis as any).createMiddleware = (options: any, __opts: any) => {
    const resolvedOptions = { type: "request", ...(__opts || options) };
    const setValidator = (validator: any) =>
      (globalThis as any).createMiddleware({}, Object.assign(resolvedOptions, { validator, inputValidator: validator }));
    return {
      options: resolvedOptions,
      middleware: (middleware: any) =>
        (globalThis as any).createMiddleware({}, Object.assign(resolvedOptions, { middleware })),
      validator: setValidator,
      inputValidator: setValidator,
      client: (client: any) =>
        (globalThis as any).createMiddleware({}, Object.assign(resolvedOptions, { client })),
      server: (server: any) =>
        (globalThis as any).createMiddleware({}, Object.assign(resolvedOptions, { server })),
    };
  };
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);

      if (response.status < 500) {
        return response;
      }

      // Log swallowed H3 errors for debugging without blocking response stream
      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          const body = await response.clone().text();
          const payload = JSON.parse(body);
          if (payload?.unhandled === true) {
            console.error(consumeLastCapturedError() ?? new Error(`SSR Error: ${body}`));
          }
        } catch {}
      }

      return response;
    } catch (error) {
      console.error("SSR Handler exception:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};
