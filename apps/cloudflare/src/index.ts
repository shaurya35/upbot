type RequestData = {
  url: string;
  websiteId: string;
  regionId: string;
  regionCode: string;
  timeout?: number;
};

function isRequestData(obj: unknown): obj is RequestData {
  if (typeof obj !== "object" || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.url === "string" &&
    typeof o.websiteId === "string" &&
    typeof o.regionId === "string" &&
    typeof o.regionCode === "string" &&
    (o.timeout === undefined || typeof o.timeout === "number")
  );
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Validate request method
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse and validate input
    let data: unknown;
    try {
      data = await request.json();
    } catch (err) {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (!isRequestData(data)) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Validate URL format
    try {
      new URL(data.url);
    } catch {
      return new Response("Invalid URL format", { status: 400 });
    }

    // Perform HTTP check
    const start = Date.now();
    const result: any = {
      websiteId: data.websiteId,
      regionId: data.regionId,
      status: "UNKNOWN",
      responseTime: 0
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        Math.min(data.timeout ?? 10000, 30000)
      );

      const response = await fetch(data.url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        cf: {
          colo: data.regionCode,
          cacheEverything: false
        }
      });

      clearTimeout(timeout);
      result.status = response.ok ? "UP" : "DOWN";
      result.statusCode = response.status;
    } catch (error: any) {
      result.status = "DOWN";
      result.error = error && typeof error === "object" && "message" in error
        ? (error as any).message
        : "Request failed";
    }

    result.responseTime = Date.now() - start;

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }
}