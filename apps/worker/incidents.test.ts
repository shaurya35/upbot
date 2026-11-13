import { beforeEach, describe, expect, it, mock } from "bun:test";
let state: any;
let incidents: any[];
let checks: any[];
let deliveries: any[];
let channels: any[];
const tx: any = {
  $queryRaw: async () => [],
  website: {
    findFirst: async () => ({
      id: "site",
      userId: "owner",
      monitorInterval: 30,
    }),
  },
  check: {
    createMany: async ({ data }: any) => {
      if (checks.some((c) => c.observationKey === data[0].observationKey))
        return { count: 0 };
      checks.push(data[0]);
      return { count: 1 };
    },
  },
  incidentState: {
    upsert: async () => state,
    update: async ({ data }: any) => Object.assign(state, data),
  },
  incident: {
    findFirst: async () => incidents.find((i) => !i.recoveredAt) || null,
    create: async ({ data }: any) => {
      const incident = {
        id: `incident-${incidents.length}`,
        recoveredAt: null,
        ...data,
      };
      incidents.push(incident);
      return incident;
    },
    update: async ({ where, data }: any) =>
      Object.assign(
        incidents.find((i) => i.id === where.id),
        data,
      ),
  },
  alertChannel: {
    findMany: async ({ where }: any) =>
      channels.filter(
        (channel) =>
          channel.userId === where.userId &&
          channel.type === where.type &&
          channel.isActive &&
          channel.webhookUrl,
      ),
  },
  webhookDelivery: {
    createMany: async ({ data }: any) => {
      deliveries.push(...data);
    },
  },
};
mock.module("store/client", () => ({
  prisma: { $transaction: async (callback: any) => callback(tx) },
}));
const { saveObservation } = await import("./incidents");
const now = Date.now();
const observation = (key: string, status: "UP" | "DOWN", offset: number) => ({
  observationKey: key,
  websiteId: "site",
  regionId: "region",
  status,
  responseTime: 10,
  createdAt: new Date(now + offset),
});
beforeEach(() => {
  state = {
    lastObservedAt: null,
    consecutiveDown: 0,
    firstDownAt: null,
    firstDownReason: null,
  };
  incidents = [];
  checks = [];
  deliveries = [];
  channels = [
    {
      id: "channel",
      userId: "owner",
      type: "WEBHOOK",
      isActive: true,
      webhookUrl: "https://receiver.invalid",
    },
  ];
});
describe("incident transitions", () => {
  it("confirms an outage, ignores duplicates and records recovery", async () => {
    await saveObservation(observation("a", "DOWN", -30000));
    expect(incidents).toHaveLength(0);
    await saveObservation(observation("b", "DOWN", -20000));
    await saveObservation(observation("b", "DOWN", -20000));
    expect(incidents).toHaveLength(1);
    expect(deliveries.map((d) => d.eventType)).toEqual(["outage"]);
    await saveObservation(observation("c", "UP", -10000));
    expect(incidents[0].recoveredAt).toBeTruthy();
    expect(deliveries.map((d) => d.eventType)).toEqual(["outage", "recovery"]);
  });
  it("notifies only active webhooks belonging to the monitor owner", async () => {
    channels.push({
      id: "other",
      userId: "another-owner",
      type: "WEBHOOK",
      isActive: true,
      webhookUrl: "https://other.invalid",
    });
    channels.push({
      id: "disabled",
      userId: "owner",
      type: "WEBHOOK",
      isActive: false,
      webhookUrl: "https://disabled.invalid",
    });
    await saveObservation(observation("a", "DOWN", -30000));
    await saveObservation(observation("b", "DOWN", -20000));
    expect(deliveries.map((delivery) => delivery.channelId)).toEqual([
      "channel",
    ]);
  });
  it("does not carry a failure across a stale monitoring gap", async () => {
    state.lastObservedAt = new Date(now - 180000);
    state.consecutiveDown = 1;
    state.firstDownAt = new Date(now - 180000);
    await saveObservation(observation("fresh", "DOWN", -10000));
    expect(incidents).toHaveLength(0);
    expect(state.consecutiveDown).toBe(1);
  });
  it("ignores old observations and a single failure followed by recovery", async () => {
    await saveObservation(observation("a", "DOWN", -20000));
    await saveObservation(observation("b", "UP", -10000));
    await saveObservation(observation("old", "DOWN", -30000));
    expect(incidents).toHaveLength(0);
    expect(deliveries).toHaveLength(0);
  });
});
