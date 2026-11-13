import { describe, expect, it, mock } from "bun:test";
const databaseUrl = process.env.TEST_WEB_DATABASE_URL;
mock.module("node:dns/promises", () => ({
  resolveMx: async () => [{ exchange: "mail.example.test", priority: 10 }],
}));

describe.skipIf(!databaseUrl)("waitlist integration", () => {
  it("adds a signup, updates the count, and rejects a duplicate", async () => {
    process.env.WEB_DATABASE_URL = databaseUrl;
    const { POST } = await import("../src/app/api/submit/route");
    const { GET } = await import("../src/app/api/waitlist/route");
    const before = (await (await GET()).json()).users;
    const email = `test-${Date.now()}@example.test`;
    const request = () =>
      new Request("http://localhost/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      }) as any;
    expect((await POST(request())).status).toBe(201);
    expect((await (await GET()).json()).users).toBe(before + 1);
    expect((await POST(request())).status).toBe(409);
  });
});
