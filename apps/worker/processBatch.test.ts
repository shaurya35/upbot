import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";
let acked: string[] = [];
let exists = false;
let active = true;
let failSave = false;
let saved = 0;
let calledChecker = 0;
process.env.WORKER_URL = "http://checker.invalid";
mock.module("store/client", () => ({
  prisma: {
    website: {
      findFirst: async () =>
        active ? { url: "https://example.com", monitorInterval: 30 } : null,
    },
    check: { findFirst: async () => (exists ? { id: "saved" } : null) },
    $disconnect: async () => {},
  },
}));
mock.module("redis-streams/client", () => ({
  xAckBulk: async (ids: string[]) => {
    acked.push(...ids);
  },
  xReadGroup: async () => [],
  claimPendingMessages: async () => [],
  disconnect: async () => {},
}));
mock.module("./incidents", () => ({
  saveObservation: async () => {
    if (failSave) throw new Error("database unavailable");
    saved++;
  },
  deliverPending: async () => {},
}));
mock.module("axios", () => ({
  default: {
    post: async () => {
      calledChecker++;
      return {
        data: {
          checks: [
            {
              regionId: "region",
              status: "UP",
              responseTime: 10,
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };
    },
    isAxiosError: () => false,
  },
}));
const { processBatch } = await import("./index");
const message = {
  id: "1-0",
  message: { id: "site", url: "https://example.com", monitorInterval: 30 },
};
beforeEach(() => {
  acked = [];
  exists = false;
  active = true;
  failSave = false;
  saved = 0;
  calledChecker = 0;
});
describe("check job acknowledgement", () => {
  it("leaves jobs pending when persistence fails", async () => {
    failSave = true;
    const log = spyOn(console, "error").mockImplementation(() => {});
    try {
      await processBatch([message]);
    } finally {
      log.mockRestore();
    }
    expect(acked).toEqual([]);
  });
  it("acknowledges stored results without performing a second check", async () => {
    exists = true;
    await processBatch([message]);
    expect(acked).toEqual(["1-0"]);
    expect(calledChecker).toBe(0);
  });
  it("skips deleted monitors", async () => {
    active = false;
    await processBatch([message]);
    expect(acked).toEqual(["1-0"]);
    expect(calledChecker).toBe(0);
  });
  it("acknowledges after successful persistence", async () => {
    await processBatch([message]);
    expect(saved).toBe(1);
    expect(acked).toEqual(["1-0"]);
  });
});
