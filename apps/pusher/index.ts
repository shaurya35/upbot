import { createClient } from "redis";
import { prisma } from "store/client";
import { xAddBulk } from "redis-streams/client";

const SCHEDULE_KEY = "upbot:schedule";
const CHECK_INTERVAL = 5000;
const DEFAULT_TIMEOUT = 10000;
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => console.error("Redis Error:", err));

async function processDueWebsites() {
  try {
    const now = Date.now();
    const dueWebsites = await redisClient.zRangeByScore(SCHEDULE_KEY, 0, now);

    if (!dueWebsites.length) return;

    const websites = dueWebsites.map((website) => JSON.parse(website));

    const payloads = [];
    const pipeline = redisClient.multi();

    for (const website of websites) {
      try {
        const payload = {
          id: website.id,
          url: website.url,
          userId: website.userId,
          regions: website.regions,
          timeout: DEFAULT_TIMEOUT,
        };

        payloads.push(payload);

        const nextRun = now + website.monitorInterval * 1000;
        pipeline.zAdd(SCHEDULE_KEY, {
          score: nextRun,
          value: JSON.stringify(website),
        });
      } catch (error) {
        console.error(
          `Error creating payload for website ${website.id}:`,
          error
        );
      }
    }

    if (payloads.length > 0) {
      await xAddBulk(payloads);
    }

    await pipeline.exec();
  } catch (error) {
    console.error("Processing error:", error);
  }
}

async function initScheduler() {
  try {
    await redisClient.del(SCHEDULE_KEY);

    const websites = await prisma.website.findMany({
      where: { deletedAt: null },
      include: {
        regions: {
          select: {
            id: true,
            code: true,
          },
        },
        user: {
          select: {
            plan: true,
          },
        },
      },
    });

    const jobs = websites.map((website) => ({
      id: website.id,
      url: website.url,
      userId: website.userId,
      monitorInterval: website.monitorInterval,
      regions: website.regions.map((region) => ({
        regionId: region.id,
        regionCode: region.code,
      })),
    }));

    const pipeline = redisClient.multi();
    const now = Date.now();

    jobs.forEach((job) => {
      const nextRun = now + Math.random() * job.monitorInterval * 1000;
      pipeline.zAdd(SCHEDULE_KEY, {
        score: nextRun,
        value: JSON.stringify(job),
      });
    });

    await pipeline.exec();

    setInterval(processDueWebsites, CHECK_INTERVAL);
  } catch (error) {
    console.error("Initialization failed:", error);
    process.exit(1);
  }
}

async function initialize() {
  try {
    await redisClient.connect();
    await initScheduler();
  } catch (error) {
    console.error("Initialization failed:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await redisClient.quit();
  process.exit(0);
});

initialize();
