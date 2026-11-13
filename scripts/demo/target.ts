const port = Number(process.env.DEMO_TARGET_PORT || 8790);
const secret = process.env.DEMO_CONTROL_SECRET;
if (!secret)
  throw new Error("Set DEMO_CONTROL_SECRET before starting the demo target");
let healthy = true;
const events: unknown[] = [];
Bun.serve({
  port,
  hostname: process.env.DEMO_TARGET_HOST || "127.0.0.1",
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/healthy") return new Response("OK", { status: 200 });
    if (url.pathname === "/switchable")
      return new Response(healthy ? "OK" : "Unavailable", {
        status: healthy ? 200 : 503,
      });
    if (url.pathname === "/control" && request.method === "POST") {
      if (request.headers.get("x-demo-secret") !== secret)
        return new Response("Unauthorized", { status: 401 });
      const body = (await request.json()) as { healthy?: boolean };
      if (typeof body.healthy !== "boolean")
        return new Response("Invalid state", { status: 400 });
      healthy = body.healthy;
      return Response.json({ healthy });
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      const body = (await request.json()) as {
        id?: string;
        type?: string;
        websiteName?: string;
        occurredAt?: string;
      };
      events.push({
        id: body.id,
        type: body.type,
        websiteName: body.websiteName,
        occurredAt: body.occurredAt,
      });
      if (events.length > 100) events.shift();
      return Response.json({ ok: true });
    }
    if (
      url.pathname === "/events" &&
      request.headers.get("x-demo-secret") === secret
    )
      return Response.json(events);
    return new Response("Not found", { status: 404 });
  },
});
console.log(`Demo target listening on port ${port}`);
