import { createClient } from "redis";
import { prisma } from "store/client";
import { getMonitoringRegions } from "store/regions";
import { reconcileIds } from "./reconciliation";

const SCHEDULE_KEY = "upbot:schedule";
const SETTINGS_KEY = "upbot:schedule:settings";
const STREAM_KEY = "upbot:websites";
const CHECK_INTERVAL = 5000;
const WEBSITE_REFRESH_INTERVAL = parseInt(
  process.env.WEBSITE_REFRESH_INTERVAL || "300000",
);
const redisClient = createClient({ url: process.env.REDIS_URL });
const regions = getMonitoringRegions(process.env.MONITOR_REGIONS).map(
  (region) => ({
    regionId: region.id,
    regionCode: region.code,
  }),
);

type Website = {
  id: string;
  url: string;
  userId: string;
  monitorInterval: number;
};
const toJob = (website: Website) => ({ ...website, timeout: 10000, regions });
redisClient.on("error", (error) => console.error("Redis error:", error));

async function refreshWebsites() {
  const websites = await prisma.website.findMany({
    where: { deletedAt: null, user: { deletedAt: null } },
    select: { id: true, url: true, userId: true, monitorInterval: true },
  });
  const existingIds = await redisClient.zRange(SCHEDULE_KEY, 0, -1);
  const changes = reconcileIds(
    websites.map((website) => website.id),
    existingIds,
  );
  const transaction = redisClient.multi();
  for (const id of changes.removed) {
    transaction.zRem(SCHEDULE_KEY, id);
    transaction.hDel(SETTINGS_KEY, id);
  }
  const added = new Set(changes.added);
  for (const website of websites) {
    transaction.hSet(SETTINGS_KEY, website.id, JSON.stringify(toJob(website)));
    if (added.has(website.id)) {
      transaction.zAdd(SCHEDULE_KEY, {
        score: Date.now() + Math.random() * website.monitorInterval * 1000,
        value: website.id,
      });
    }
  }
  await transaction.exec();
}

async function processDueWebsites() {
  const now = Date.now();
  const ids = await redisClient.zRangeByScore(SCHEDULE_KEY, 0, now);
  if (!ids.length) return;
  const settings = await redisClient.hmGet(SETTINGS_KEY, ids);
  for (let index = 0; index < ids.length; index++) {
    const setting = settings[index];
    if (!setting) {
      await redisClient.zRem(SCHEDULE_KEY, ids[index]);
      continue;
    }
    const job = JSON.parse(setting);
    await redisClient.eval(
      `
      redis.call('XADD', KEYS[1], '*', 'id', ARGV[1], 'url', ARGV[2], 'userId', ARGV[3], 'regions', ARGV[4], 'timeout', ARGV[5], 'monitorInterval', ARGV[6])
      return redis.call('ZADD', KEYS[2], ARGV[7], ARGV[1])
    `,
      {
        keys: [STREAM_KEY, SCHEDULE_KEY],
        arguments: [
          job.id,
          job.url,
          job.userId,
          JSON.stringify(job.regions),
          String(job.timeout),
          String(job.monitorInterval),
          String(now + job.monitorInterval * 1000),
        ],
      },
    );
  }
}

let operation = Promise.resolve();
function enqueue(task: () => Promise<void>) {
  operation = operation
    .then(task)
    .catch((error) => console.error("Scheduler error:", error));
}

async function main() {
  await redisClient.connect();
  // The old scheduler stored complete JSON jobs as sorted-set members.
  const existing = await redisClient.zRange(SCHEDULE_KEY, 0, -1);
  const legacy = existing.filter((member) => member.startsWith("{"));
  if (legacy.length) await redisClient.zRem(SCHEDULE_KEY, legacy);
  await refreshWebsites();
  enqueue(processDueWebsites);
  setInterval(() => enqueue(processDueWebsites), CHECK_INTERVAL);
  setInterval(() => enqueue(refreshWebsites), WEBSITE_REFRESH_INTERVAL);
  console.log(`Scheduler started; refresh every ${WEBSITE_REFRESH_INTERVAL}ms`);
}

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  await operation;
  await Promise.allSettled([
    redisClient.isOpen ? redisClient.quit() : Promise.resolve(),
    prisma.$disconnect(),
  ]);
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
main().catch((error) => {
  console.error("Scheduler startup failed:", error);
  process.exit(1);
});
