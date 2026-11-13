import { describe, expect, it } from "bun:test";
import { currentMonitorStatus } from "./monitorStatus";

describe("monitor freshness", () => {
  it("reports unknown when no observation exists", () =>
    expect(currentMonitorStatus(undefined, 30, 500000)).toBe("UNKNOWN"));
  it("uses the two-minute minimum and keeps the boundary fresh", () => {
    const last = { status: "UP" as const, createdAt: new Date(0) };
    expect(currentMonitorStatus(last, 30, 120000)).toBe("UP");
    expect(currentMonitorStatus(last, 30, 120001)).toBe("UNKNOWN");
  });
  it("uses three intervals when greater than two minutes", () => {
    const last = { status: "DOWN" as const, createdAt: new Date(0) };
    expect(currentMonitorStatus(last, 60, 180000)).toBe("DOWN");
    expect(currentMonitorStatus(last, 60, 180001)).toBe("UNKNOWN");
  });
});
