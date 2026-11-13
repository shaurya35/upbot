import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
let delivery: any;
let update: any;
const prisma = {
  webhookDelivery: {
    findMany: async () => [delivery],
    update: async ({ data }: any) => {
      update = data;
    },
  },
};
mock.module("store/client", () => ({ prisma }));
const { deliverPending } = await import("./incidents");
beforeEach(() => {
  delivery = {
    id: "event",
    incidentId: "incident",
    eventType: "outage",
    occurredAt: new Date(),
    attempts: 0,
    channel: { isActive: true, webhookUrl: "https://receiver.invalid" },
    incident: { websiteId: "site", website: { name: "Demo" } },
  };
  update = null;
});
afterEach(() => mock.restore());
describe("webhook delivery", () => {
  it("retries failed delivery using the same event identity", async () => {
    let eventId = "";
    const original = globalThis.fetch;
    globalThis.fetch = (async (_url: any, options: any) => {
      eventId = options.headers["Idempotency-Key"];
      return new Response(null, { status: 503 });
    }) as unknown as typeof fetch;
    try {
      await deliverPending();
    } finally {
      globalThis.fetch = original;
    }
    expect(eventId).toBe("event");
    expect(update).toMatchObject({ attempts: 1, status: "PENDING" });
  });
  it("records final failure on the fifth unsuccessful attempt", async () => {
    delivery.attempts = 4;
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(null, { status: 500 })) as unknown as typeof fetch;
    try {
      await deliverPending();
    } finally {
      globalThis.fetch = original;
    }
    expect(update).toMatchObject({ attempts: 5, status: "FAILED" });
  });
  it("marks a successful delivery sent", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(null, { status: 204 })) as unknown as typeof fetch;
    try {
      await deliverPending();
    } finally {
      globalThis.fetch = original;
    }
    expect(update).toMatchObject({ attempts: 1, status: "SENT" });
  });
});
