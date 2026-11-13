import { expect, it } from "bun:test";
import { reconcileIds } from "./reconciliation";

it("adds new monitors, removes deleted monitors, and keeps existing schedules", () => {
  expect(
    reconcileIds(
      ["unchanged", "edited", "new"],
      ["unchanged", "edited", "deleted"],
    ),
  ).toEqual({ added: ["new"], removed: ["deleted"] });
});
